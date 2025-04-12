import { FormData } from '@/lib/types'

interface OrderFormProps {
  formData: FormData
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onSubmit: (e: React.FormEvent) => void
  isSubmitting: boolean
  disabled?: boolean
}

export default function OrderForm({ 
  formData, 
  onChange, 
  onSubmit, 
  isSubmitting,
  disabled = false
}: OrderFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Name field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Vardas <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={onChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          placeholder="Įveskite savo vardą"
          disabled={isSubmitting || disabled}
        />
      </div>
      
      {/* Email field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          El. paštas <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={onChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          placeholder="jusu@pastas.lt"
          disabled={isSubmitting || disabled}
        />
      </div>
      
      {/* Comments field */}
      <div>
        <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
          Papildomi komentarai
        </label>
        <textarea
          id="comments"
          name="comments"
          rows={3}
          value={formData.comments}
          onChange={onChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          placeholder="Jei turite papildomų pageidavimų ar klausimų, užrašykite juos čia"
          disabled={isSubmitting || disabled}
        />
      </div>
      
      {/* Submit buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting || disabled}
        >
          {isSubmitting ? (
            <>
              <svg 
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Siunčiama...
            </>
          ) : "Pateikti užsakymą"}
        </button>
        
        <button
          type="button"
          className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting || disabled}
          onClick={() => {
            alert('Ši funkcija bus prieinama netrukus!');
          }}
        >
          Gauti peržiūrą el. paštu
        </button>
      </div>
      
      {disabled && (
        <div className="text-sm text-gray-500 italic">
          Pirma įkelkite paveikslėlį, kad galėtumėte pateikti užsakymą.
        </div>
      )}
    </form>
  )
}