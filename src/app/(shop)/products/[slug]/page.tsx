import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import AddToCartButton from "@/components/shop/AddToCartButton";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: { category: true },
  });

  if (!product) notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Images */}
        <div className="relative h-96 bg-gray-100 rounded-2xl overflow-hidden">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-300">No image</div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <p className="text-sm text-indigo-500 font-medium mb-2">{product.category.name}</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{product.name}</h1>
          <p className="text-3xl font-bold text-indigo-600 mb-4">LKR {product.price.toLocaleString()}</p>

          <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>

          <div className="flex items-center gap-2 mb-6 text-sm">
            {product.stock > 0 ? (
              <span className="text-green-600 font-medium">In Stock ({product.stock} available)</span>
            ) : (
              <span className="text-red-500 font-medium">Out of Stock</span>
            )}
          </div>

          <AddToCartButton product={{
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0] ?? "",
            stock: product.stock,
            slug: product.slug,
          }} />
        </div>
      </div>
    </div>
  );
}
