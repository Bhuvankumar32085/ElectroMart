"use client";

import { useState, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { addProduct } from "@/redux/selices/vendorSclice";

/* ================= TYPES ================= */

type ImageFile = File | null;

interface ProductForm {
  title: string;
  description: string;
  price: string;
  stock: string;
  warranty: string;
  replacementDays: string;
}

interface ProductOptions {
  freeDelivery: boolean;
  payOnDelivery: boolean;
}

/* ================= CONSTANTS ================= */

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

const CATEGORIES = [
  "Fashion & Lifestyle",
  "Electronics & Gadgets",
  "Home & Living",
  "Beauty & Personal Care",
  "Toys, Kids & Baby",
  "Food & Grocery",
  "Sports & Fitness",
  "Automotive Accessories",
  "Gift & Handicraft",
  "Books & Stationery",
  "Other",
];

/* ================= PAGE ================= */

export default function AddProductPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [images, setImages] = useState<ImageFile[]>([null, null, null, null]);

  const [form, setForm] = useState<ProductForm>({
    title: "",
    description: "",
    price: "",
    stock: "",
    warranty: "",
    replacementDays: "",
  });
  const router = useRouter();
  const [category, setCategory] = useState<string>("");
  const [detailsPoints, setDetailsPoints] = useState<string[]>([""]);
  const [isWearable, setIsWearable] = useState<boolean>(false);
  const [sizes, setSizes] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  // if category selecetd other than user and set costome category
  const [customCategory, setCustomCategory] = useState<string>("");

  const [options, setOptions] = useState<ProductOptions>({
    freeDelivery: false,
    payOnDelivery: true,
  });

  /* ================= HANDLERS ================= */

  const handleImageChange = (index: number, file: ImageFile) => {
    const updated = [...images];
    updated[index] = file;
    setImages(updated);
  };

  const updateForm = (key: keyof ProductForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSize = (size: string) => {
    setSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  };

  const updatePoint = (i: number, value: string) => {
    const arr = [...detailsPoints];
    arr[i] = value;
    setDetailsPoints(arr);
  };

  const addPoint = () => setDetailsPoints((p) => [...p, ""]);

  const removePoint = (i: number) =>
    setDetailsPoints((p) => p.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    // check number and stock is not negative
    const price = Number(form.price);
    const stock = Number(form.stock);
    const replacementDays = Number(form.replacementDays);

    if (price < 0) {
      return setErrorMsg("Price cannot be negative");
    }
    if (stock < 0) {
      return setErrorMsg("Stock cannot be negative");
    }
    if (replacementDays < 0) {
      return setErrorMsg("Replacement days cannot be negative");
    }

    if (
      !form.title ||
      !form.description ||
      !form.price ||
      !form.stock ||
      !category ||
      !images[0] ||
      !images[1] ||
      !images[2] ||
      !images[3]
    ) {
      return setErrorMsg("Please fill all required fields");
    }
    if (isWearable && sizes.length === 0) {
      return setErrorMsg("Please select sizes for wearable product");
    }
    setLoading(true);
    setErrorMsg("");
    try {
      // form data
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("stock", form.stock);
      formData.append("warranty", form.warranty);
      formData.append("replacementDays", form.replacementDays);
      formData.append(
        "category",
        category === "Other" ? customCategory : category,
      );
      formData.append("isWearable", String(isWearable));
      sizes.forEach((s) => formData.append("sizes", s));
      detailsPoints.forEach((p) => formData.append("detailsPoints", p));
      formData.append("image1", images[0] as Blob);
      formData.append("image2", images[1] as Blob);
      formData.append("image3", images[2] as Blob);
      formData.append("image4", images[3] as Blob);
      formData.append("freeDelivery", String(options.freeDelivery));
      formData.append("payOnDelivery", String(options.payOnDelivery));
      // submit

      const res = await axios.post("/api/vendor/add-product", formData);
      if (res.data.success) {
        alert("Product added successfully!");
        dispatch(addProduct(res.data.product));

        router.push("/");
      }
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        setErrorMsg(error.response?.data?.message || "Invalid input");
      } else {
        setErrorMsg("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <main className="min-h-screen bg-[#050810] text-white px-4 py-10">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">
          Add New Product
        </h1>
        <p className="text-white/50 mb-8">Step {step} of 2</p>

        {/* STEPS */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
            >
              <Card title="Step 1 · Upload Images">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {images.map((img, i) => (
                    <label
                      key={i}
                      className="relative aspect-square max-w-37.5 w-full mx-auto rounded-xl border border-dashed border-white/20 overflow-hidden cursor-pointer hover:border-cyan-400"
                    >
                      {img ? (
                        <Image
                          src={URL.createObjectURL(img)}
                          alt="preview"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-white/40 text-xs">
                          Image {i + 1}
                        </div>
                      )}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleImageChange(
                            i,
                            e.target.files ? e.target.files[0] : null,
                          )
                        }
                      />
                    </label>
                  ))}
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="mt-6 w-full py-3 bg-cyan-500 text-black font-semibold rounded-xl"
                >
                  Next
                </button>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >
              <Card title="Step 2 · Product Details">
                <div className="space-y-4">
                  <Input
                    label="Title"
                    value={form.title}
                    onChange={(e) => updateForm("title", e.target.value)}
                  />

                  <Textarea
                    label="Description"
                    value={form.description}
                    onChange={(e) => updateForm("description", e.target.value)}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Price"
                      type="number"
                      value={form.price}
                      onChange={(e) => updateForm("price", e.target.value)}
                    />
                    <Input
                      label="Stock"
                      type="number"
                      value={form.stock}
                      onChange={(e) => updateForm("stock", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Warranty"
                      type="text"
                      placeholder="warranty (e.g. 1 year)"
                      value={form.warranty}
                      onChange={(e) => updateForm("warranty", e.target.value)}
                    />
                    <Input
                      label="Replacement Days"
                      type="number"
                      placeholder="Replacement Days (e.g. 15)"
                      value={form.replacementDays}
                      onChange={(e) =>
                        updateForm("replacementDays", e.target.value)
                      }
                    />
                  </div>

                  <Select
                    label="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    options={CATEGORIES}
                  />
                  {category === "Other" && (
                    <Input
                      label="Custom Category"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                    />
                  )}

                  {/* DETAILS POINTS ✅ */}
                  <div>
                    <p className="text-xs text-gray-400 mb-2">
                      Product Highlights
                    </p>

                    <div className="space-y-3">
                      {detailsPoints.map((p, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            value={p}
                            onChange={(e) => updatePoint(i, e.target.value)}
                            placeholder={`Point ${i + 1}`}
                            className="input flex-1"
                          />
                          {detailsPoints.length > 1 && (
                            <button
                              onClick={() => removePoint(i)}
                              className="px-3 rounded-lg bg-red-500/20 text-red-400"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={addPoint}
                      className="mt-3 text-sm text-cyan-400"
                    >
                      + Add point
                    </button>
                  </div>

                  <Toggle
                    label="Wearable Product"
                    checked={isWearable}
                    onChange={setIsWearable}
                  />

                  {isWearable && (
                    <div className="flex flex-wrap gap-2">
                      {SIZES.map((s) => (
                        <button
                          key={s}
                          onClick={() => toggleSize(s)}
                          className={`px-3 py-1 rounded-full border text-sm ${
                            sizes.includes(s)
                              ? "bg-cyan-400 text-black"
                              : "border-white/20 text-white/60"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-4 text-sm">
                    <Checkbox
                      label="Free Delivery"
                      checked={options.freeDelivery}
                      onChange={(v) =>
                        setOptions((p) => ({ ...p, freeDelivery: v }))
                      }
                    />
                    <Checkbox
                      label="Cash on Delivery"
                      checked={options.payOnDelivery}
                      onChange={(v) =>
                        setOptions((p) => ({ ...p, payOnDelivery: v }))
                      }
                    />
                  </div>
                  {errorMsg && (
                    <p className="text-red-500 text-sm text-center">
                      {errorMsg}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="w-1/2 py-3 border border-white/20 rounded-xl"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="w-1/2 py-3 bg-cyan-500 text-black font-semibold rounded-xl"
                    >
                      {loading ? (
                        <Loader2 className=" animate-spin mx-auto" />
                      ) : (
                        "Submit"
                      )}
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

/* ================= REUSABLE ================= */

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#0c1224] p-6 rounded-2xl border border-white/10">
      <h2 className="font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Input(
  props: React.InputHTMLAttributes<HTMLInputElement> & { label: string },
) {
  const { label, ...rest } = props;
  return (
    <div>
      <label className="text-xs text-white/50">{label}</label>
      <input {...rest} className="input" />
    </div>
  );
}

function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string },
) {
  const { label, ...rest } = props;
  return (
    <div>
      <label className="text-xs text-white/50">{label}</label>
      <textarea {...rest} className="input" />
    </div>
  );
}

function Select(
  props: {
    label: string;
    options: string[];
  } & React.SelectHTMLAttributes<HTMLSelectElement>,
) {
  const { label, options, ...rest } = props;
  return (
    <div>
      <label className="text-xs text-white/50">{label}</label>
      <select {...rest} className="input">
        <option value="">Select</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex gap-2 items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-white/70">{label}</span>
    </label>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex gap-2 items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-white/70">{label}</span>
    </label>
  );
}
