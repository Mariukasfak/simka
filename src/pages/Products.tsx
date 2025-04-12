const Products = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Our Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Product cards will go here */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold">Sample Product</h2>
          <p className="text-gray-600">Coming soon...</p>
        </div>
      </div>
    </div>
  )
}

export default Products