import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Package } from 'lucide-react';

const AffiliateLinksPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const affiliateLinks = [
    "https://s.shopee.co.id/AKQkYVXIEr",
    // Add more affiliate links here
  ];

  const fetchMetaData = async (url) => {
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      const data = await response.json();

      if (!data.contents) return null;

      const parser = new DOMParser();
      const doc = parser.parseFromString(data.contents, 'text/html');

      const getMetaContent = (selectors) => {
        for (const selector of selectors) {
          const content = doc.querySelector(selector)?.content;
          if (content) return content;
        }
        return null;
      };

      const title = getMetaContent([
        'meta[property="og:title"]',
        'meta[name="twitter:title"]'
      ]) || doc.querySelector('title')?.textContent || 'Product Title';

      const image = getMetaContent([
        'meta[property="og:image"]',
        'meta[name="twitter:image"]'
      ]);

      const description = getMetaContent([
        'meta[property="og:description"]',
        'meta[name="description"]',
        'meta[name="twitter:description"]'
      ]) || 'No description available';

      const price = getMetaContent([
        'meta[property="product:price:amount"]',
        'meta[property="og:price:amount"]'
      ]) || extractPriceFromText(doc.body.textContent);

      return {
        url,
        title: title.slice(0, 80),
        image,
        price,
        description: description.slice(0, 150),
      };
    } catch (error) {
      console.error(`Failed to fetch ${url}:`, error);
      return {
        url,
        title: 'Unable to load product',
        image: null,
        price: null,
        description: 'Product information unavailable',
      };
    }
  };

  const extractPriceFromText = (text) => {
    const priceRegex = /[\$₹€£¥]\s*[\d,]+(?:\.\d{2})?|\d+[\.,]\d+\s*(?:USD|EUR|GBP|INR|IDR|Rp)/gi;
    const matches = text.match(priceRegex);
    return matches?.[0] || null;
  };

  useEffect(() => {
    const loadProducts = async () => {
      if (!affiliateLinks.length) {
        setLoading(false);
        return;
      }

      const productData = await Promise.allSettled(
        affiliateLinks.map(fetchMetaData)
      );

      const validProducts = productData
        .filter(result => result.status === 'fulfilled' && result.value)
        .map(result => result.value);

      setProducts(validProducts);
      setLoading(false);
    };

    loadProducts();
  }, []);

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
      onClick={() => window.open(product.url, '_blank', 'popup,noopener,noreferrer')}
    >
      <div className="relative bg-muted">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
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

      <CardContent className="p-2">
        <h3 className="font-semibold leading-tight line-clamp-2 mb-2 text-sm">
          {product.title}
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
      <p className="text-muted-foreground">Add some affiliate links to get started!</p>
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
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold tracking-tight">My Affiliate Products</h1>
            <p className="text-muted-foreground mt-2">Discover great products and deals</p>
          </div>
        </header>

        <main className="container mx-auto">
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