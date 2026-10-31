import gpayLogo from "../assets/upi/gpay.png";
import phonepeLogo from "../assets/upi/phonepe.png";
import paytmLogo from "../assets/upi/paytm.png";
import bhimLogo from "../assets/upi/bhim.png";
import whatsappLogo from "../assets/upi/whatsapp.png";

export const DEFAULT_UPI_SETTINGS = {
  upiId: "r86j742993@mairtel",
  payeeName: "Messho Shooping",
};

export const UPI_APPS = [
  { id: "gpay", name: "Google Pay", short: "G Pay", color: "#1a73e8", logo: gpayLogo },
  { id: "phonepe", name: "PhonePe", short: "Pe", color: "#5f259f", logo: phonepeLogo },
  { id: "paytm", name: "Paytm", short: "P", color: "#00baf2", logo: paytmLogo },
  { id: "bhim", name: "BHIM UPI", short: "B", color: "#f1592a", logo: bhimLogo },
  { id: "whatsapp", name: "WhatsApp Pay", short: "W", color: "#25d366", logo: whatsappLogo },
  { id: "any", name: "Any UPI App", short: "UPI", color: "#16a34a", logo: null },
];

export const getUpiApp = (appId) =>
  UPI_APPS.find((app) => app.id === appId) || UPI_APPS[0];

const toBase64 = (value) => {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

/**
 * Builds UPI intent links for Android and iOS.
 *
 * - gpay: Google Pay's `tez://` scheme (works on Android and iOS).
 * - phonepe: PhonePe native collect link (amount is in paise).
 * - paytm: Paytm wallet intent.
 * - bhim / whatsapp / any: standard `upi://pay` intent so the OS can
 *   open an installed UPI app on both Android and iOS.
 */
export const buildUpiPaymentLink = ({
  app,
  upiId,
  payeeName,
  amount,
  note,
  transactionRef,
}) => {
  const merchantId = upiId || DEFAULT_UPI_SETTINGS.upiId;
  const merchantName = payeeName || DEFAULT_UPI_SETTINGS.payeeName;
  const amountValue = Number(amount) || 0;
  const amountText = amountValue.toFixed(2);
  const transactionId = transactionRef || `BH${Date.now()}`;
  const transactionNote = note || "Order payment";

  const params = new URLSearchParams({
    pa: merchantId,
    pn: merchantName,
    am: amountText,
    cu: "INR",
    tn: transactionNote,
    tr: transactionId,
  });

  switch (app) {
    case "gpay":
      return `tez://upi/pay?${params.toString()}`;

    case "phonepe": {
      const payload = {
        p2pPaymentCheckoutParams: {
          checkoutType: "COLLECT",
          initialAmount: Math.round(amountValue * 100),
          note: {
            type: "text",
            message: transactionNote,
          },
          supportedInstruments: -1,
        },
        contact: {
          type: "EXTERNAL_MERCHANT",
          name: merchantName,
          vpa: merchantId,
        },
      };

      return `phonepe://native?data=${encodeURIComponent(
        toBase64(JSON.stringify(payload))
      )}&id=p2ppayment`;
    }

    case "paytm":
      return `paytmmp://cash_wallet?${params.toString()}&featuretype=money_transfer`;

    default:
      return `upi://pay?${params.toString()}`;
  }
};
