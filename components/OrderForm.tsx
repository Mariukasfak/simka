"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { orderFormSchema, type OrderFormData } from "@/lib/validations/order";
import toast from "react-hot-toast";

interface OrderFormProps {
  onSubmit: (data: OrderFormData) => Promise<void>;
  isSubmitting: boolean;
  disabled?: boolean;
  designPreview: string | null;
}

export default function OrderForm({
  onSubmit,
  isSubmitting,
  disabled = false,
  designPreview,
}: OrderFormProps) {
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      quantity: 1,
      size: "M",
    },
  });

  const handleFormSubmit = async (data: OrderFormData) => {
    try {
      await onSubmit(data);
      reset();
      toast.success("Užsakymas sėkmingai pateiktas!");
    } catch (error) {
      toast.error("Įvyko klaida pateikiant užsakymą");
      console.error("Order submission error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Preview Modal */}
      {showPreview && designPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Užsakymo peržiūra</h3>
            <img
              src={designPreview}
              alt="Design Preview"
              className="mb-4 max-h-96 mx-auto"
            />
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="btn btn-secondary"
              >
                Grįžti
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Siunčiama..." : "Patvirtinti užsakymą"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Vardas <span className="text-red-500">*</span>
        </label>
        <input
          {...register("name")}
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          disabled={isSubmitting || disabled}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          El. paštas <span className="text-red-500">*</span>
        </label>
        <input
          {...register("email")}
          type="email"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          disabled={isSubmitting || disabled}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="size"
            className="block text-sm font-medium text-gray-700"
          >
            Dydis <span className="text-red-500">*</span>
          </label>
          <select
            {...register("size")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            disabled={isSubmitting || disabled}
          >
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="XXL">XXL</option>
          </select>
          {errors.size && (
            <p className="mt-1 text-sm text-red-600">{errors.size.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="quantity"
            className="block text-sm font-medium text-gray-700"
          >
            Kiekis <span className="text-red-500">*</span>
          </label>
          <input
            {...register("quantity", { valueAsNumber: true })}
            type="number"
            min="1"
            max="100"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            disabled={isSubmitting || disabled}
          />
          {errors.quantity && (
            <p className="mt-1 text-sm text-red-600">
              {errors.quantity.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="comments"
          className="block text-sm font-medium text-gray-700"
        >
          Papildomi komentarai
        </label>
        <textarea
          {...register("comments")}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          placeholder="Jei turite papildomų pageidavimų ar klausimų, užrašykite juos čia"
          disabled={isSubmitting || disabled}
        />
        {errors.comments && (
          <p className="mt-1 text-sm text-red-600">{errors.comments.message}</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="flex-1 btn btn-primary"
          disabled={isSubmitting || disabled || !designPreview}
        >
          Peržiūrėti užsakymą
        </button>
      </div>

      {disabled && (
        <div className="text-sm text-gray-500 italic">
          Pirma įkelkite paveikslėlį, kad galėtumėte pateikti užsakymą.
        </div>
      )}
    </form>
  );
}
