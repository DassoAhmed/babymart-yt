// validation.ts - Zod schemas for specific routes
import { z } from "zod";

// ========== ZOD SCHEMAS FOR SPECIFIC ROUTES ==========

// 1. Login Page Schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// 2. Register Page Schema
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name cannot exceed 50 characters")
      .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(val),
        "Please enter a valid phone number"
      ),
    role: z.enum(["admin", "user", "deliveryman"]).default("user"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// 3. Account Page Schema (User Profile)
export const accountSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, "Please enter a valid phone number"),
  address: z
    .string()
    .min(1, "Address is required")
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address cannot exceed 200 characters"),
  city: z
    .string()
    .min(1, "City is required")
    .min(2, "City must be at least 2 characters")
    .max(50, "City cannot exceed 50 characters"),
  state: z
    .string()
    .min(1, "State is required")
    .min(2, "State must be at least 2 characters")
    .max(50, "State cannot exceed 50 characters"),
  zipCode: z
    .string()
    .min(1, "Zip code is required")
    .min(5, "Zip code must be at least 5 characters")
    .max(10, "Zip code cannot exceed 10 characters"),
  avatar: z.string().url("Please enter a valid URL").optional(),
});

export type AccountFormData = z.infer<typeof accountSchema>;

// 4. Users Page Schema (User Management)
export const userSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  role: z.enum(["admin", "user", "deliveryman"], {
    errorMap: () => ({ message: "Please select a valid role" }),
  }),
  status: z.enum(["active", "inactive", "suspended"], {
    errorMap: () => ({ message: "Please select a valid status" }),
  }),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(val),
      "Please enter a valid phone number"
    ),
  avatar: z.string().url("Please enter a valid URL").optional(),
});

export type UserFormData = z.infer<typeof userSchema>;

// 5. Products Page Schema
export const productSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .min(3, "Product name must be at least 3 characters")
    .max(100, "Product name cannot exceed 100 characters"),
  sku: z
    .string()
    .min(1, "SKU is required")
    .regex(/^[A-Z0-9-]{4,20}$/, "SKU must be 4-20 characters (uppercase letters, numbers, hyphens)"),
  description: z
    .string()
    .min(1, "Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description cannot exceed 1000 characters"),
  price: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Price must be a number greater than 0",
    })
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(val.toString()), {
      message: "Price must have up to 2 decimal places",
    }),
  quantity: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
    .refine((val) => !isNaN(val) && val >= 0, {
      message: "Quantity must be a whole number and cannot be negative",
    }),
  category: z.string().min(1, "Category is required"),
  brand: z.string().min(1, "Brand is required"),
  weight: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
    .optional()
    .refine((val) => !val || val > 0, {
      message: "Weight must be greater than 0",
    }),
  dimensions: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        /^\d+(\.\d+)?x\d+(\.\d+)?x\d+(\.\d+)?$/.test(val) ||
        /^\d+(\.\d+)?\s*x\s*\d+(\.\d+)?\s*x\s*\d+(\.\d+)?$/.test(val),
      "Dimensions must be in format: LxWxH (e.g., 10x5x3 or 10.5x5.2x3.1)"
    ),
  images: z.array(z.string().url("Please enter valid image URLs")).optional(),
  status: z.enum(["active", "inactive", "draft"]).default("draft"),
});

export type ProductFormData = z.infer<typeof productSchema>;

// 6. Categories Page Schema
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name cannot exceed 50 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
  parentCategory: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  image: z.string().url("Please enter a valid URL").optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

// 7. Brands Page Schema
export const brandSchema = z.object({
  name: z
    .string()
    .min(1, "Brand name is required")
    .min(2, "Brand name must be at least 2 characters")
    .max(50, "Brand name cannot exceed 50 characters"),
  logo: z.string().url("Please enter a valid logo URL").optional(),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
  website: z.string().url("Please enter a valid website URL").optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type BrandFormData = z.infer<typeof brandSchema>;

// 8. Banners Page Schema
export const bannerSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title cannot exceed 100 characters"),
  description: z.string().max(200, "Description cannot exceed 200 characters").optional(),
  imageUrl: z.string().min(1, "Image URL is required").url("Please enter a valid image URL"),
  linkUrl: z.string().url("Please enter a valid link URL").optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  startDate: z.string().min(1, "Start date is required").refine(
    (val) => !isNaN(Date.parse(val)),
    "Please enter a valid start date"
  ),
  endDate: z.string().min(1, "End date is required").refine(
    (val) => !isNaN(Date.parse(val)),
    "Please enter a valid end date"
  ),
  position: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
    .refine((val) => !isNaN(val) && val >= 1, {
      message: "Position must be a number greater than or equal to 1",
    }),
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
);

export type BannerFormData = z.infer<typeof bannerSchema>;

// 9. Orders Page Schema
export const orderSchema = z.object({
  customerName: z
    .string()
    .min(1, "Customer name is required")
    .min(2, "Customer name must be at least 2 characters"),
  customerEmail: z
    .string()
    .min(1, "Customer email is required")
    .email("Please enter a valid email address"),
  customerPhone: z
    .string()
    .min(1, "Customer phone is required")
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, "Please enter a valid phone number"),
  shippingAddress: z
    .string()
    .min(1, "Shipping address is required")
    .min(10, "Shipping address must be at least 10 characters"),
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"], {
    errorMap: () => ({ message: "Please select a valid status" }),
  }),
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded"], {
    errorMap: () => ({ message: "Please select a valid payment status" }),
  }),
  paymentMethod: z.enum(["credit_card", "paypal", "cash_on_delivery", "bank_transfer"], {
    errorMap: () => ({ message: "Please select a valid payment method" }),
  }),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product ID is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        price: z.number().min(0, "Price cannot be negative"),
      })
    )
    .min(1, "Order must contain at least one item"),
  notes: z.string().optional(),
});

export type OrderFormData = z.infer<typeof orderSchema>;

// 10. Invoices Page Schema
export const invoiceSchema = z.object({
  invoiceNumber: z
    .string()
    .min(1, "Invoice number is required")
    .regex(/^INV-\d{4}-\d{6}$/, "Invoice number must be in format: INV-YYYY-XXXXXX"),
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z
    .string()
    .min(1, "Customer email is required")
    .email("Please enter a valid email address"),
  issueDate: z.string().min(1, "Issue date is required").refine(
    (val) => !isNaN(Date.parse(val)),
    "Please enter a valid issue date"
  ),
  dueDate: z.string().min(1, "Due date is required").refine(
    (val) => !isNaN(Date.parse(val)),
    "Please enter a valid due date"
  ),
  items: z
    .array(
      z.object({
        description: z.string().min(1, "Item description is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        unitPrice: z.number().min(0, "Unit price cannot be negative"),
      })
    )
    .min(1, "Invoice must contain at least one item"),
  taxRate: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
    .refine((val) => !isNaN(val) && val >= 0 && val <= 100, {
      message: "Tax rate must be between 0 and 100",
    })
    .default(0),
  discount: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
    .refine((val) => !isNaN(val) && val >= 0, {
      message: "Discount cannot be negative",
    })
    .default(0),
  notes: z.string().optional(),
}).refine(
  (data) => new Date(data.dueDate) > new Date(data.issueDate),
  {
    message: "Due date must be after issue date",
    path: ["dueDate"],
  }
);

export type InvoiceFormData = z.infer<typeof invoiceSchema>;

// ========== EXPORT ALL SCHEMAS ==========

export const validationSchemas = {
  login: loginSchema,
  register: registerSchema,
  account: accountSchema,
  users: userSchema,
  products: productSchema,
  categories: categorySchema,
  brands: brandSchema,
  banners: bannerSchema,
  orders: orderSchema,
  invoices: invoiceSchema,
} as const;

export type ValidationSchemaName = keyof typeof validationSchemas;

// Utility function to get schema by name
export const getSchema = (schemaName: ValidationSchemaName) => {
  return validationSchemas[schemaName];
};

// Example usage with react-hook-form:
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { loginSchema, type LoginFormData } from "./validation";
//
// const {
//   register,
//   handleSubmit,
//   formState: { errors },
// } = useForm<LoginFormData>({
//   resolver: zodResolver(loginSchema),
// });