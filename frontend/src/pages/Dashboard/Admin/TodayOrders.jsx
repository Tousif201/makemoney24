import React, { useState, useEffect } from 'react';
import { Edit, Eye, Trash2, X } from 'lucide-react';
import { fetchOrders, rejectOrders } from '../../../../api/order'; // Import the backend functions

const TodayOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rejectLoading, setRejectLoading] = useState(false);
    const [rejectError, setRejectError] = useState(null);
    const [showRejectConfirmModal, setShowRejectConfirmModal] = useState(false);
    const [orderIdToReject, setOrderIdToReject] = useState(null);

    useEffect(() => {
        const loadOrders = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetchOrders();
                if (Array.isArray(response)) {
                    setOrders(response.map(order => ({ ...order, isRejected: order.isAdminApproved === 'rejected' })));
                } else if (response && Array.isArray(response.data)) {
                    setOrders(response.data.map(order => ({ ...order, isRejected: order.isAdminApproved === 'rejected' })));
                } else {
                    setError('Failed to load orders: Data format is incorrect.');
                    console.error('Error loading orders: Incorrect data format', response);
                }
                setLoading(false);
            } catch (err) {
                setError(err.message || 'Failed to fetch orders.');
                setLoading(false);
                console.error("Error fetching today's orders:", err);
            }
        };

        loadOrders();
    }, []);

    const getStatusColor = (status, type) => {
        const colors = {
            orderStatus: {
                'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
                'Processing': 'bg-blue-100 text-blue-800 border-blue-200',
                'Confirmed': 'bg-green-100 text-green-800 border-green-200',
                'Delivered': 'bg-emerald-100 text-emerald-800 border-emerald-200',
                'Cancelled': 'bg-red-100 text-red-800 border-red-200'
            },
            paymentStatus: {
                'Paid': 'bg-green-100 text-green-800 border-green-200',
                'Pending': 'bg-orange-100 text-orange-800 border-orange-200',
                'Failed': 'bg-red-100 text-red-800 border-red-200',
                'Refunded': 'bg-gray-100 text-gray-800 border-gray-200'
            },
            approvalStatus: {
                'approved': 'bg-green-100 text-green-800 border-green-200',
                'rejected': 'bg-red-100 text-red-800 border-red-200',
                'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200'
            }
        };
        return colors[type]?.[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const triggerRejectConfirmation = (orderId) => {
        setOrderIdToReject(orderId);
        setShowRejectConfirmModal(true);
    };

    const handleRejectOrder = async () => {
        if (orderIdToReject) {
            setRejectLoading(true);
            setRejectError(null);
            try {
                await rejectOrders(orderIdToReject);
                // Update the frontend state to reflect the rejection and disable the button
                setOrders(orders.map(order =>
                    order.orderId === orderIdToReject ? { ...order, isAdminApproved: 'rejected', isRejected: true } : order
                ));
                setShowRejectConfirmModal(false);
                setOrderIdToReject(null);
                setRejectLoading(false);
            } catch (err) {
                setRejectError(err.message || 'Failed to reject order.');
                setRejectLoading(false);
                console.error("Error rejecting order:", err);
            }
        }
    };

    const cancelReject = () => {
        setShowRejectConfirmModal(false);
        setOrderIdToReject(null);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    if (loading) {
        return <div>Loading orders...</div>;
    }

    if (error) {
        return <div className="text-red-500">Error loading orders: {error}</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Today's Orders</h1>
                    <p className="text-gray-600">Manage and track all orders for today</p>
                </div>

                {rejectError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline">{rejectError}</span>
                </div>}

                {/* Table Container */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        {orders.length === 0 ? (
                            <div className="px-6 py-4">No orders yet for today.</div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Order ID</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Vendor Name</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">User Name</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Products</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Order Amount</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Order Status</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Payment Status</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">IsApproved</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {orders.map((order, index) => (
                                        <tr key={order.orderId} className={`hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-indigo-600">{order.orderId}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{order.vendorName}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{order.userName}</div>
                                            </td>
                                            {/* Display Products */}
                                            <td className="px-6 py-4">
                                                {order.products && order.products.map((product, index) => (
                                                    <div key={index} className="text-sm text-gray-900">
                                                        {product.productTitle} ({product.quantity} x ₹{product.price})
                                                    </div>
                                                ))}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-green-600">₹{order.products && order.products.reduce((sum, product) => sum + (product.quantity * product.price), 0).toFixed(2)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{formatDate(order.orderDate)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus, 'orderStatus')}`}>
                                                    {order.orderStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.paymentStatus, 'paymentStatus')}`}>
                                                    {order.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.isAdminApproved, 'approvalStatus')}`}>
                                                    {order.isAdminApproved}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => triggerRejectConfirmation(order.orderId)}
                                                        className={`p-1 text-white bg-red-500 flex items-center gap-x-1 hover:bg-red-600 rounded-lg transition-all duration-200 ${rejectLoading || order.isRejected ? 'cursor-not-allowed opacity-50' : ''}`}
                                                        title="Reject Order"
                                                        disabled={rejectLoading || order.isRejected}
                                                    >
                                                        <X size={16} />
                                                        <span>Reject</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Reject Confirmation Modal */}
                {showRejectConfirmModal && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">Confirm Rejection</h3>
                                <button onClick={cancelReject} className="hover:bg-gray-100 rounded-full p-1 transition-colors duration-200">
                                    <X size={16} />
                                </button>
                            </div>
                            <p className="text-gray-700 mb-4">Are you sure you want to reject this order?</p>
                            <div className="flex justify-end space-x-2">
                                <button onClick={cancelReject} className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors duration-200">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRejectOrder}
                                    className={`bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors duration-200 ${rejectLoading ? 'cursor-not-allowed' : ''}`}
                                    disabled={rejectLoading}
                                >
                                    {rejectLoading ? <span className="animate-pulse">Rejecting...</span> : 'Reject'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TodayOrders;