import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Footer from '../components/global/Footer';
import Navbar from '../components/global/Navbar';
import { useProduct, useProducts } from '../context/useProducts';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Truck, ShieldCheck, Lock, BadgeCheck,
  MapPin, Clock, ChevronRight, CheckCircle2, ArrowLeft, AlertCircle, Smartphone,
} from 'lucide-react';
import { createOrder, getUpiSettings } from '../utils/firestoreApi';
import { DEFAULT_UPI_SETTINGS, UPI_APPS, buildUpiPaymentLink, getUpiApp } from '../utils/upi';

// ── localStorage helpers ──────────────────────────────────────────────────

const ORDERS_KEY = 'basket_orders';

export const saveOrderToLocalStorage = (order) => {
  try {
    const existing = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    const updated = [order, ...existing];
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save order:', e);
  }
};

export const getOrdersFromLocalStorage = () => {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
  } catch {
    return [];
  }
};

const generateOrderId = () => {
  const ts = Date.now().toString().slice(-8);
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `BLK${ts}${rand}`;
};

const isMobileDevice = () =>
  /android|iphone|ipad|ipod/i.test(navigator.userAgent);

// ── Main component ────────────────────────────────────────────────────────

const CheckoutPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = useProduct(id);
  const { loading: productsLoading } = useProducts();

  const [billing, setBilling] = useState({ fullName: '', mobile: '', city: '', state: '', pincode: '', fullAddress: '' });
  const [upiApp, setUpiApp] = useState('gpay');
  const [upiSettings, setUpiSettings] = useState(DEFAULT_UPI_SETTINGS);
  const [paymentLink, setPaymentLink] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submissionError, setSubmissionError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const originalPrice = parseFloat(product?.offer_price?.replace(/[^0-9.]/g, '')) || 0;
  const originalMRP   = parseFloat(product?.original_price?.replace(/[^0-9.]/g, '')) || originalPrice;
  const toPay         = originalPrice;

  const selectedApp = useMemo(() => getUpiApp(upiApp), [upiApp]);

  const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 2);
  const formattedDelivery = deliveryDate.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });

  // Load the merchant UPI details saved by the admin.
  useEffect(() => {
    let active = true;
    getUpiSettings()
      .then((settings) => {
        if (active) setUpiSettings(settings);
      })
      .catch((err) => {
        console.error('Failed to load UPI settings:', err);
      });
    return () => {
      active = false;
    };
  }, []);

  // ── Validators ────────────────────────────────────────────────────────────

  const validateField = useCallback((name, value) => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().split(' ').filter(Boolean).length < 2) return 'Enter first and last name';
        return null;
      case 'mobile':
        if (!value.trim()) return 'Mobile number is required';
        if (!/^\d{10}$/.test(value)) return 'Enter a valid 10-digit number';
        if (/^[0-4]/.test(value)) return 'Enter a valid Indian mobile number';
        return null;
      case 'city':   return value.trim() ? null : 'City is required';
      case 'state':  return value.trim() ? null : 'State is required';
      case 'pincode':
        if (!value.trim()) return 'Pincode is required';
        if (!/^\d{6}$/.test(value)) return 'Enter a valid 6-digit pincode';
        if (/^0/.test(value)) return 'Invalid pincode';
        return null;
      case 'fullAddress':
        if (!value.trim()) return 'Address is required';
        if (value.trim().length < 10) return 'Enter a more complete address';
        return null;
      default: return null;
    }
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleBilling = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === 'mobile' || name === 'pincode') v = value.replace(/\D/g, '');
    setBilling(p => ({ ...p, [name]: v }));
    if (touched[name]) setErrors(p => ({ ...p, [name]: validateField(name, v) }));
    setSubmissionError(null);
  };

  const handleBlurBilling = (e) => {
    const { name, value } = e.target;
    setTouched(p => ({ ...p, [name]: true }));
    setErrors(p => ({ ...p, [name]: validateField(name, value) }));
  };

  const validateAll = () => {
    const billingFields = ['fullName', 'mobile', 'city', 'state', 'pincode', 'fullAddress'];
    setTouched(billingFields.reduce((a, k) => ({ ...a, [k]: true }), {}));
    const newErrs = {};
    billingFields.forEach(k => { const e = validateField(k, billing[k]); if (e) newErrs[k] = e; });
    setErrors(newErrs);
    return Object.keys(newErrs).length === 0;
  };

  const isBillingValid = ['fullName', 'mobile', 'city', 'state', 'pincode', 'fullAddress'].every(
    k => !validateField(k, billing[k])
  );

  // ── Submit ────────────────────────────────────────────────────────────────

  const handlePlaceOrder = async (e) => {
    e?.preventDefault();

    if (paymentLink) return;

    if (!validateAll()) {
      setSubmissionError('Please fix the errors above before placing your order.');
      return;
    }

    setIsLoading(true);
    setSubmissionError(null);

    const payload = {
      fullName: billing.fullName,
      mobile: `+91${billing.mobile}`,
      cityState: `${billing.city}, ${billing.state}`,
      pincode: billing.pincode,
      fullAddress: billing.fullAddress,
      productName: product.title,
      quantity: 1,
      totalAmount: toPay,
      originalAmount: originalMRP,
      paymentMethod: 'UPI',
      upiApp: selectedApp.name,
      upiId: upiSettings.upiId,
    };

    try {
      await createOrder(payload);

      const newOrder = {
        id: generateOrderId(),
        placedAt: new Date().toISOString(),
        date: new Date().toLocaleString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit', hour12: true,
        }),
        status: 'pending',
        items: [{
          name: product.title,
          qty: 1,
          price: product.offer_price,
          img: product.img,
          productId: product.id,
        }],
        total: fmt(toPay),
        totalRaw: toPay,
        saved: fmt(originalMRP - originalPrice),
        address: `${billing.fullAddress}, ${billing.city}, ${billing.state} – ${billing.pincode}`,
        fullName: billing.fullName,
        mobile: `+91${billing.mobile}`,
        paymentMethod: `UPI (${selectedApp.name})`,
        upiApp: selectedApp.name,
        upiId: upiSettings.upiId,
        pincode: billing.pincode,
        productId: product.id,
      };

      saveOrderToLocalStorage(newOrder);

      if (typeof window.fbq === 'function') {
        window.fbq('track', 'Purchase', { value: toPay, currency: 'INR' });
      }

      const url = buildUpiPaymentLink({
        app: upiApp,
        upiId: upiSettings.upiId,
        payeeName: upiSettings.payeeName,
        amount: toPay,
        note: `${product.title} - ${billing.fullName}`,
      });

      setPaymentLink({ url, appName: selectedApp.name });

      // One-tap experience on phones. If the app does not open (or the
      // browser blocks the custom scheme), the payment button stays visible
      // so the user can tap it again.
      if (isMobileDevice()) {
        window.location.href = url;
      }
    } catch (err) {
      console.error('Order placement error:', err);
      setSubmissionError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!product) return (
    <p className={`mt-32 text-center ${productsLoading ? 'text-gray-500' : 'text-red-500'}`}>
      {productsLoading ? 'Loading product…' : 'Product not found.'}
    </p>
  );

  const inputCls = (field) =>
    `w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:border-[#0c831f] focus:ring-1 focus:ring-[#0c831f] transition-colors bg-white text-gray-900 placeholder:text-gray-400 ${
      touched[field] && errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200'
    }`;

  const FieldError = ({ field }) =>
    touched[field] && errors[field]
      ? <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5"><AlertCircle size={11} />{errors[field]}</p>
      : null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 pt-20 sm:pt-24 pb-4">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0c831f] mb-4 transition-colors">
            <ArrowLeft size={15} /> Back to cart
          </button>

          {/* ETA Banner */}
          <div className="bg-[#0c831f] text-white rounded-2xl px-4 py-3 mb-5 flex items-center gap-3">
            <Clock size={20} className="shrink-0" />
            <div className="flex-1">
              <p className="font-extrabold text-sm sm:text-base leading-tight">Delivery in 4 hours</p>
              <p className="text-xs text-green-100 mt-0.5">{formattedDelivery}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-green-200 shrink-0">
              <MapPin size={13} /><span className="hidden sm:inline">Kolkata</span>
            </div>
          </div>

          {/* Steps */}
          <div className="flex items-center gap-2 mb-5 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
            <button onClick={() => setStep(1)} className={`flex items-center gap-2 text-sm font-semibold ${step >= 1 ? 'text-[#0c831f]' : 'text-gray-400'}`}>
              {isBillingValid && step === 2
                ? <CheckCircle2 size={16} className="text-[#0c831f]" />
                : <span className="w-5 h-5 rounded-full bg-[#0c831f] text-white text-xs flex items-center justify-center font-bold">1</span>
              }
              <span>Address</span>
            </button>
            <ChevronRight size={14} className="text-gray-300" />
            <button onClick={() => isBillingValid && setStep(2)} className={`flex items-center gap-2 text-sm font-semibold ${step === 2 ? 'text-[#0c831f]' : 'text-gray-400'}`}>
              <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold ${step === 2 ? 'bg-[#0c831f] text-white' : 'bg-gray-200 text-gray-500'}`}>2</span>
              Payment
            </button>
          </div>

          <form onSubmit={handlePlaceOrder} noValidate>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* ── LEFT ── */}
              <div className="lg:col-span-2 flex flex-col gap-4">

                {/* STEP 1 — Address */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-4 sm:px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin size={15} className="text-[#0c831f]" />
                      <h2 className="font-bold text-gray-900 text-sm sm:text-base">Delivery address</h2>
                    </div>
                    {isBillingValid && step === 2 && (
                      <button type="button" onClick={() => setStep(1)} className="text-xs text-[#0c831f] font-semibold hover:underline">Change</button>
                    )}
                  </div>

                  {isBillingValid && step === 2 ? (
                    <div className="px-4 sm:px-5 py-3 text-sm">
                      <p className="font-semibold text-gray-900">{billing.fullName}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{billing.fullAddress}, {billing.city}, {billing.state} – {billing.pincode}</p>
                      <p className="text-gray-500 text-xs">+91 {billing.mobile}</p>
                    </div>
                  ) : (
                    <div className="px-4 sm:px-5 py-4 space-y-3">
                      <div>
                        <input name="fullName" value={billing.fullName} onChange={handleBilling} onBlur={handleBlurBilling} placeholder="Full name (first and last) *" className={inputCls('fullName')} />
                        <FieldError field="fullName" />
                      </div>
                      <div>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm rounded-l-xl shrink-0">+91</span>
                          <input name="mobile" value={billing.mobile} onChange={handleBilling} onBlur={handleBlurBilling} maxLength={10} placeholder="Mobile number *" inputMode="numeric" className={`${inputCls('mobile')} rounded-l-none`} />
                        </div>
                        <FieldError field="mobile" />
                      </div>
                      <div>
                        <input name="fullAddress" value={billing.fullAddress} onChange={handleBilling} onBlur={handleBlurBilling} placeholder="House / flat / floor, street, area *" className={inputCls('fullAddress')} />
                        <FieldError field="fullAddress" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <input name="city" value={billing.city} onChange={handleBilling} onBlur={handleBlurBilling} placeholder="City *" className={inputCls('city')} />
                          <FieldError field="city" />
                        </div>
                        <div>
                          <input name="state" value={billing.state} onChange={handleBilling} onBlur={handleBlurBilling} placeholder="State *" className={inputCls('state')} />
                          <FieldError field="state" />
                        </div>
                      </div>
                      <div className="w-full sm:w-1/2">
                        <input name="pincode" value={billing.pincode} onChange={handleBilling} onBlur={handleBlurBilling} maxLength={6} placeholder="Pincode *" inputMode="numeric" className={inputCls('pincode')} />
                        <FieldError field="pincode" />
                      </div>
                      <button
                        type="button"
                        disabled={!isBillingValid}
                        onClick={() => {
                          setTouched(p => ({ ...p, fullName: true, mobile: true, city: true, state: true, pincode: true, fullAddress: true }));
                          if (isBillingValid) setStep(2);
                        }}
                        className={`w-full py-3.5 rounded-xl text-sm font-extrabold transition-all ${isBillingValid ? 'bg-[#0c831f] text-white hover:bg-[#1a9e2e] active:scale-[0.98]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                      >
                        Continue to payment →
                      </button>
                    </div>
                  )}
                </div>

                {/* STEP 2 — Payment (UPI only) */}
                {step === 2 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-4 sm:px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                      <Smartphone size={15} className="text-[#0c831f]" />
                      <h2 className="font-bold text-gray-900 text-sm sm:text-base">Pay with UPI</h2>
                    </div>

                    <div className="px-4 sm:px-5 py-4 space-y-4">
                      <div className="flex items-start gap-2.5 bg-green-50 border border-green-200 rounded-xl px-3 py-3">
                        <ShieldCheck size={15} className="text-[#0c831f] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-[#0c831f]">UPI only — 100% secure</p>
                          <p className="text-[11px] text-green-700 mt-0.5">
                            Works with Google Pay, PhonePe, Paytm, BHIM and WhatsApp Pay on Android and iPhone.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {UPI_APPS.map((app) => {
                          const selected = upiApp === app.id;
                          return (
                            <label
                              key={app.id}
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                                paymentLink ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
                              } ${selected ? 'border-[#0c831f] bg-green-50' : 'border-gray-200'}`}
                            >
                              <input
                                type="radio"
                                name="upiApp"
                                value={app.id}
                                checked={selected}
                                disabled={Boolean(paymentLink)}
                                onChange={() => setUpiApp(app.id)}
                                className="sr-only"
                              />
                              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selected ? 'border-[#0c831f]' : 'border-gray-300'}`}>
                                {selected && <span className="w-2 h-2 rounded-full bg-[#0c831f]" />}
                              </span>
                              {app.logo ? (
                                <img
                                  src={app.logo}
                                  alt={`${app.name} logo`}
                                  className="w-10 h-10 rounded-lg object-contain bg-white shrink-0"
                                  loading="lazy"
                                />
                              ) : (
                                <span
                                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-[11px] font-extrabold shrink-0"
                                  style={{ background: app.color }}
                                >
                                  {app.short}
                                </span>
                              )}
                              <div className="min-w-0">
                                <p className={`text-sm font-bold ${selected ? 'text-[#0c831f]' : 'text-gray-800'}`}>{app.name}</p>
                                <p className="text-[10px] text-gray-400">
                                  {app.id === 'any' ? 'Choose from installed UPI apps' : 'Pay using UPI intent'}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>

                      <div className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Paying to</span>
                          <span className="font-semibold text-gray-800">{upiSettings.payeeName}</span>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-gray-500">UPI ID</span>
                          <span className="font-mono text-[11px] text-gray-800 break-all text-right">{upiSettings.upiId}</span>
                        </div>
                      </div>

                      {submissionError && (
                        <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 flex items-start gap-2 text-xs text-red-700 font-medium">
                          <AlertCircle size={13} className="shrink-0 mt-0.5" />{submissionError}
                        </div>
                      )}

                      {paymentLink ? (
                        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-4 space-y-3">
                          <div className="flex items-start gap-2.5">
                            <CheckCircle2 size={16} className="text-[#0c831f] shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-bold text-[#0c831f]">Order placed successfully</p>
                              <p className="text-[11px] text-green-700 mt-0.5">
                                Complete the payment in your UPI app. If it did not open automatically, tap the button below.
                              </p>
                            </div>
                          </div>
                          <a
                            href={paymentLink.url}
                            className="flex w-full items-center justify-between py-3.5 px-4 rounded-xl bg-[#0c831f] text-white font-extrabold text-sm hover:bg-[#1a9e2e] transition-all"
                          >
                            <span>Pay {fmt(toPay)} with {paymentLink.appName}</span>
                            <ChevronRight size={18} />
                          </a>
                          <p className="text-[10px] text-green-700 text-center">
                            Payment will be confirmed by the store after UPI transfer.
                          </p>
                        </div>
                      ) : (
                        <>
                          <button
                            type="submit"
                            disabled={isLoading}
                            className={`hidden md:flex w-full items-center justify-between py-4 px-5 rounded-xl text-white font-extrabold text-sm transition-all ${isLoading ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#0c831f] hover:bg-[#1a9e2e] active:scale-[0.98]'}`}
                          >
                            <span>{isLoading ? 'Placing order...' : `Pay ${fmt(toPay)} with ${selectedApp.name}`}</span>
                            {!isLoading && <ChevronRight size={18} />}
                          </button>
                          <p className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Lock size={10} /> You will be redirected to your UPI app to complete the payment.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ── RIGHT: Bill ── */}
              <div className="flex flex-col gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-4 sm:px-5 py-3 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 text-sm">Order summary</h3>
                  </div>
                  <div className="flex items-center gap-3 px-4 sm:px-5 py-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 p-1.5 shrink-0">
                      <img src={product.img} alt={product.title} className="w-full h-full object-contain" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">{product.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Qty: 1</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 sm:px-5 py-4">
                  <h3 className="font-bold text-gray-900 text-sm mb-4">Bill details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-gray-600"><span>MRP</span><span className="text-gray-900 font-medium">{fmt(originalMRP)}</span></div>
                    {originalMRP > originalPrice && (
                      <div className="flex justify-between text-[#0c831f]"><span className="font-medium">Product discount</span><span className="font-semibold">− {fmt(originalMRP - originalPrice)}</span></div>
                    )}
                    <div className="flex justify-between text-gray-600"><span>Delivery fee</span><span className="text-[#0c831f] font-semibold">Free</span></div>

                    <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between">
                      <span className="font-bold text-gray-900 text-base">To pay</span>
                      <span className="font-extrabold text-gray-900 text-base">{fmt(toPay)}</span>
                    </div>
                  </div>
                  <div className="mt-4 bg-green-50 rounded-xl px-3 py-2.5 text-xs text-[#0c831f] font-semibold text-center">
                    🎉 You're saving {fmt(originalMRP - originalPrice)} on this order!
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: <ShieldCheck size={13} />, label: '100% Genuine' },
                    { icon: <Truck size={13} />, label: 'Free Delivery' },
                    { icon: <Lock size={13} />, label: 'Secure UPI' },
                    { icon: <BadgeCheck size={13} />, label: '7-Day Return' },
                  ].map((b, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 px-3 py-2 flex items-center gap-1.5">
                      <span className="text-[#0c831f] shrink-0">{b.icon}</span>
                      <span className="text-[11px] font-medium text-gray-500">{b.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      {step === 2 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-3 py-3">
          {paymentLink ? (
            <a
              href={paymentLink.url}
              className="flex w-full items-center justify-between py-3.5 px-4 rounded-2xl bg-[#0c831f] text-white font-extrabold text-sm"
            >
              <div className="flex flex-col leading-tight text-left">
                <span className="text-[10px] text-green-200">Order placed</span>
                <span>{fmt(toPay)}</span>
              </div>
              <div className="flex items-center gap-1">Pay with {paymentLink.appName} <ChevronRight size={16} /></div>
            </a>
          ) : (
            <>
              <button
                type="button" onClick={handlePlaceOrder} disabled={isLoading}
                className={`flex w-full items-center justify-between py-3.5 px-4 rounded-2xl text-white font-extrabold text-sm transition-all ${isLoading ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#0c831f] hover:bg-[#1a9e2e] active:scale-[0.98]'}`}
              >
                <div className="flex flex-col leading-tight text-left">
                  <span className="text-[10px] text-green-200">{isLoading ? 'Placing order...' : 'Pay securely via UPI'}</span>
                  <span>{fmt(toPay)}</span>
                </div>
                <div className="flex items-center gap-1">{selectedApp.name} <ChevronRight size={16} /></div>
              </button>
              <p className="text-[10px] text-gray-400 text-center mt-1.5">🔒 UPI only • GPay • PhonePe • Paytm • BHIM</p>
            </>
          )}
        </div>
      )}

      <Footer />
    </>
  );
};

export default CheckoutPage;
