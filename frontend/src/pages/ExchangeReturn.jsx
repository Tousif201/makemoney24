import React from 'react';

export default function ExchangeReturn() {
  return (
    <div className="min-h-screen mt-5 bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">
              Return and Refund Policy
            </h1>
            <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
              Please review our return and refund policy before initiating a request.
            </p>
          </div>
        </div>
      </div>

      {/* Policy Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 text-gray-700 leading-relaxed text-justify">
        <p>
          In case of any dissatisfaction, manufacturing or packaging defect, customers/Distributors can return or exchange the product. The customers/Distributors must contact the Distributor/Company from whom they had purchased the same, within 30 days from the date of purchase. They have to provide a reason and return the said products. In case the customer returns the product, it is the distributor’s obligation to satisfy the customer’s need for money refund or replacements of products.
        </p>

        <p>
          The Distributor can then return these products, with original Invoice to the Company. The Company will replace these products free of cost or if the distributor does not want the same products, the Company will give a cash voucher of the same amount, which can be used by the Distributor for purchasing products of their choice.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-6">Product Return Requirements:</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Reason for return</li>
          <li>Copy of Invoice</li>
          <li>Products to be returned</li>
        </ul>

        <p className="mt-4">
          For cancellation of a confirmed/placed order, please email us at{" "}
          <a
            href="mailto:info@makemoney24hrs.com"
            className="text-blue-600 underline"
          >
            info@ShreeLabhEnterprises.com
          </a>{" "}
          or write to us at <strong>Shree Labh Enterprises</strong>.
        </p>


        <p className="text-red-600 font-medium">
          Please Note: Product Return Policy is NOT valid on items if opened or damaged.
        </p>

        <p className="mt-6 font-medium">
          Shree Labh Enterprises <br />
          Niramay Hospital Back Side <br />
          Railway Station Road <br />
          Jalna - 431203 <br />
          Maharashtra, India
        </p>
      </div>
    </div>
  );
}
