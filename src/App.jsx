import { useEffect } from 'react'
import Layout from './Layout'
import { syncCartWithFirestore } from './utils/cart'

const App = () => {
  useEffect(() => {
    syncCartWithFirestore()
  }, [])

  return (
    <div>
      <Layout/>
    </div>
  )
}

export default App
