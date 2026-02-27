import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { productsApi } from "../../api/productsApi";
import type { ProductDetails } from "../../types/product";

function formatUnixTime(value?: number) {
  if (!value) return "N/A";
  return new Date(value * 1000).toLocaleString();
}

export function ProductDetailsPage() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await productsApi.getProductById(productId);
        if (!data) {
          setError("Product not found.");
          return;
        }
        setProduct(data);
      } catch {
        setError("Failed to load product.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchProduct();
  }, [productId]);

  if (isLoading) {
    return (
      <section className="p-6">
        <p className="text-sm text-slate-500">Loading product...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-sm black hover:underline"
        >
          ← Back
        </button>
        <p className="text-red-500">{error}</p>
      </section>
    );
  }

  if (!product) return null;

  const mainImage =
    product.main_images?.[0]?.urls?.[0] ??
    product.main_images?.[0]?.thumb_urls?.[0];

  return (
    <section className="p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-sm black hover:underline"
      >
        ← Back
      </button>

      <div className="rounded-xl bg-white p-6 shadow">
        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          <div>
            {mainImage ? (
              <img
                src={mainImage}
                alt={product.title}
                className="h-56 w-full rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-56 w-full items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-500">
                No image
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">{product.title}</h2>
            <p className="mt-1 text-sm text-slate-500">Product ID: {product.id}</p>

            <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
              <p>
                Brand: <span className="font-semibold">{product.brand?.name ?? "N/A"}</span>
              </p>
              <p>
                Status: <span className="font-semibold">{product.status ?? "N/A"}</span>
              </p>
              <p>
                Product Status:{" "}
                <span className="font-semibold">{product.product_status ?? "N/A"}</span>
              </p>
              <p>
                Quality Tier:{" "}
                <span className="font-semibold">{product.listing_quality_tier ?? "N/A"}</span>
              </p>
              <p>
                Created: <span className="font-semibold">{formatUnixTime(product.create_time)}</span>
              </p>
              <p>
                Updated: <span className="font-semibold">{formatUnixTime(product.update_time)}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-slate-900">Categories</h3>
          <p className="mt-2 text-sm text-slate-700">
            {product.category_chains?.map((item) => item.local_name).join(" > ") || "N/A"}
          </p>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-slate-900">Description</h3>
          <div
            className="prose prose-sm mt-2 max-w-none text-slate-700"
            dangerouslySetInnerHTML={{ __html: product.description ?? "N/A" }}
          />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Audit
            </h3>
            <p className="mt-2 text-sm text-slate-700">
              Status: <span className="font-semibold">{product.audit?.status ?? "N/A"}</span>
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Package
            </h3>
            <p className="mt-2 text-sm text-slate-700">
              Dimensions:{" "}
              <span className="font-semibold">
                {product.package_dimensions
                  ? `${product.package_dimensions.length ?? "-"} x ${
                      product.package_dimensions.width ?? "-"
                    } x ${product.package_dimensions.height ?? "-"} ${
                      product.package_dimensions.unit ?? ""
                    }`
                  : "N/A"}
              </span>
            </p>
            <p className="mt-1 text-sm text-slate-700">
              Weight:{" "}
              <span className="font-semibold">
                {product.package_weight
                  ? `${product.package_weight.value ?? "-"} ${
                      product.package_weight.unit ?? ""
                    }`
                  : "N/A"}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-slate-900">SKUs</h3>
          {product.skus?.length ? (
            <div className="mt-2 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600">
                    <th className="py-2 pr-4">SKU ID</th>
                    <th className="py-2 pr-4">Seller SKU</th>
                    <th className="py-2 pr-4">Price</th>
                    <th className="py-2 pr-4">Currency</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {product.skus.map((sku) => (
                    <tr key={sku.id} className="border-b border-slate-100">
                      <td className="py-2 pr-4 font-mono text-xs">{sku.id}</td>
                      <td className="py-2 pr-4">{sku.seller_sku || "-"}</td>
                      <td className="py-2 pr-4">{sku.price?.sale_price ?? "-"}</td>
                      <td className="py-2 pr-4">{sku.price?.currency ?? "-"}</td>
                      <td className="py-2 pr-4">{sku.status_info?.status ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No SKU data found.</p>
          )}
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-slate-900">Attributes</h3>
          {product.product_attributes?.length ? (
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {product.product_attributes.map((attr) => (
                <div key={attr.id} className="rounded-lg border border-slate-200 p-3">
                  <p className="text-sm font-medium text-slate-900">{attr.name}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {attr.values?.map((value) => value.name).filter(Boolean).join(", ") || "-"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No attributes found.</p>
          )}
        </div>
      </div>
    </section>
  );
}
