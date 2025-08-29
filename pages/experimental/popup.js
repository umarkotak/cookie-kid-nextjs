import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Package } from 'lucide-react';

const AffiliateLinksPage = () => {
  const [loading, setLoading] = useState(true);

  // Direct products array with all properties
  const products = [
    {
      url: "https://s.shopee.co.id/AKQkYVXIEr",
      name: "Miya Himi Gouache Paint Set 18/24 Warna 30ml Cat Untuk Cat Cat Air Perlengkapan Seni Murid",
      price: "Rp 150,000",
      image: "https://down-id.img.susercontent.com/file/sg-11134201-7rase-mans2mjsznf57f.webp",
      description: `【Komposisi produk】18 Warna Gouache Paint Set: --Gouache Cat *18 --Nylon Sikat *6 (Hitam, Coklat. Warna acak kirim) --Menggambar Pen *1 --Palet Warna *1`
    },
    {
      url: "https://example.com/product2",
      name: "Sample Product 2",
      price: "130.000",
      image: "https://example.com/image2.jpg",
      description: "This is a sample product description for the second product with more details."
    }
    // Add more products here
  ];

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const openPopup = (url) => {
    const popup = window.open(
      url,
      'productPopup',
      'width=800,height=600,left=' +
      (window.screen.width / 2 - 400) +
      ',top=' +
      (window.screen.height / 2 - 300) +
      ',resizable=yes,scrollbars=yes,status=no,toolbar=no,menubar=no'
    );

    if (popup) {
      popup.focus();
    }
  };

  const ProductSkeleton = () => (
    <Card className="overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </CardContent>
    </Card>
  );

  const ProductCard = ({ product }) => (
    <Card
      className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 hover:shadow-accent"
      onClick={() => openPopup(product.url)}
    >
      <div className="relative bg-muted h-48">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="absolute inset-0 hidden items-center justify-center bg-muted">
          <Package className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
          <ExternalLink className="h-4 w-4 text-white drop-shadow-lg" />
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold leading-tight line-clamp-2 mb-2 text-sm">
          {product.name}
        </h3>

        {product.price && (
          <Badge variant="secondary" className="mb-2 font-medium">
            {product.price}
          </Badge>
        )}

        <p className="text-muted-foreground line-clamp-3 text-xs">
          {product.description}
        </p>
      </CardContent>
    </Card>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Package className="h-16 w-16 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-semibold mb-2">No products found</h2>
      <p className="text-muted-foreground">Add some products to get started!</p>
    </div>
  );

  return (
    <>
      <Head>
        <title>My Affiliate Products</title>
        <meta name="description" content="Browse our curated selection of affiliate products" />
      </Head>

      <div className="">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mb-8">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold tracking-tight">My Affiliate Products</h1>
            <p className="text-muted-foreground mt-2">Discover great products and deals</p>
          </div>
        </header>

        <main className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {Array(8).fill().map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : !products.length ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {products.map((product, index) => (
                <ProductCard key={index} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default AffiliateLinksPage;