import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CategoryScrollSlider from '../components/CategoryScrollSlider';
import { getProductServices } from '../../api/productService';
import { Card, CardContent } from '@/components/ui/card';
import { Info, Loader2 } from 'lucide-react';
import ProductGrid from '../components/Products/ProductGrid';
import { getCategoryById } from '../../api/categories';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCcwIcon } from 'lucide-react';

const CategoryProductServices = () => {
    const { categoryId } = useParams();
    const [categoryProducts, setCategoryProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [errorProducts, setErrorProducts] = useState(null);
    const [category, setCategory] = useState(null);
    const [loadingCategory, setLoadingCategory] = useState(true);
    const [errorCategory, setErrorCategory] = useState(null);
    const [retryProducts, setRetryProducts] = useState(0);

    useEffect(() => {
        const fetchCategoryDetails = async () => {
            if (categoryId) {
                setLoadingCategory(true);
                setErrorCategory(null);
                try {
                    const response = await getCategoryById(categoryId);
                    console.log(response, "category");
                    setCategory(response);
                } catch (err) {
                    console.error("Error fetching category details:", err);
                    setErrorCategory("Failed to load category details.");
                } finally {
                    setLoadingCategory(false);
                }
            }
        };

        fetchCategoryDetails();
    }, [categoryId]);

    useEffect(() => {
        if (categoryId) {
            const fetchCategoryProducts = async () => {
                setLoadingProducts(true);
                setErrorProducts(null);
                try {
                    const response = await getProductServices({ categoryId });
                    console.log(response.data, "browse category");
                    setCategoryProducts(response.data);
                } catch (err) {
                    console.error("Error fetching category products:", err);
                    setErrorProducts("Failed to load products for this category. Please try again.");
                } finally {
                    setLoadingProducts(false);
                }
            };

            fetchCategoryProducts();
        }
    }, [categoryId, retryProducts]);

    const handleRetry = () => {
        setRetryProducts(prev => prev + 1);
    };

    if (loadingCategory) {
        return (
            <div className="flex justify-center items-center h-48">
                <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
                <p className="ml-4 text-lg text-gray-600">Loading category details...</p>
            </div>
        );
    }

    if (errorCategory) {
        return (
            <Alert variant="destructive">
                <Info className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errorCategory}</AlertDescription>
            </Alert>
        );
    }
    console.log(category, "cat");
    return (
        <div>
            <CategoryScrollSlider type={"product"} />
            <CategoryScrollSlider type={"service"} />

            {categoryId && category && (
                <div className="container mx-auto py-8">
                    <h2 className="text-2xl font-bold mb-4">
                        Products in {category?.name || `Category ID: ${categoryId}`}
                    </h2>
                    {loadingProducts ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
                            <p className="ml-4 text-lg text-gray-600">Loading products...</p>
                        </div>
                    ) : errorProducts ? (
                        <div className="space-y-4">
                            <Alert variant="destructive">
                                <Info className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{errorProducts}</AlertDescription>
                            </Alert>
                            <Button onClick={handleRetry}>
                                <RefreshCcwIcon className="mr-2 h-4 w-4" />
                                Retry
                            </Button>
                        </div>
                    ) : categoryProducts.length > 0 ? (
                        <ProductGrid
                            products={categoryProducts}
                            loading={loadingProducts}
                            hasMore={false}
                            lastProductElementRef={null}
                            currentPage={1}
                        />
                    ) : (
                        <Alert className="mt-4">
                            <Info className="h-4 w-4" />
                            <AlertTitle>No Products</AlertTitle>
                            <AlertDescription>No products found for this category yet.</AlertDescription>
                        </Alert>
                    )}
                </div>
            )}
            {!categoryId && (
                <div className="container mx-auto py-8">
                    <Alert className="mt-4">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Invalid Category</AlertTitle>
                        <AlertDescription>No category ID provided.</AlertDescription>
                    </Alert>
                </div>
            )}
        </div>
    );
};

export default CategoryProductServices;