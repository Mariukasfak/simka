import { Button } from '@/components/common/Button'

const Home = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Welcome to Our Store</h1>
      <p className="text-xl text-gray-600 mb-8">
        Discover our amazing products and start shopping today!
      </p>
      <Button variant="primary" onClick={() => window.location.href = '/products'}>
        Browse Products
      </Button>
    </div>
  )
}

export default Home