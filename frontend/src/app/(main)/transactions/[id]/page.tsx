"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { transactionService, Transaction } from "@/services/api/transaction";

export default function TransactionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllReceivers, setShowAllReceivers] = useState(false);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const transaction = await transactionService.getTransaction(Number(id));
        setTransaction(transaction);
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết transaction:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransaction();
  }, [id]);

  if (loading) {
    return <div className="p-6">Đang tải...</div>;
  }

  if (!transaction) {
    return <div className="p-6">Không tìm thấy transaction</div>;
  }

  // Parse receivers to show only first one with count
  const receiversArray = transaction.receivers.split(',').map(r => r.trim());
  const initialReceiversToShow = 3;
  const visibleReceivers = receiversArray.slice(0, initialReceiversToShow);
  const remainingCount = receiversArray.length - initialReceiversToShow;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Chi tiết Email Đã Gửi</h1>
        <Button onClick={() => router.push("/transactions")}>
          Quay lại danh sách
        </Button>
      </div>

      <div className="space-y-4">
        {/* Title and Template Section */}
        <div className="border border-gray-300 p-4 bg-white">
          <div className="text-lg font-semibold mb-2">{transaction.title}</div>
          <div className="text-sm text-gray-600">
            Template: {transaction.emailTemplate?.name || "Không có template"}
          </div>
        </div>

        {/* Recipients Section */}
        <div className="border border-gray-300 p-4 bg-white flex justify-between items-start">
          <div className="flex-1">
            <span className="font-medium">To: </span>
            {showAllReceivers ? (
              <div className="inline">
                {receiversArray.map((receiver, index) => (
                  <span key={index}>
                    {receiver}
                    {index < receiversArray.length - 1 && ', '}
                  </span>
                ))}
                {remainingCount > 0 && (
                  <button
                    onClick={() => setShowAllReceivers(false)}
                    className="text-blue-600 hover:text-blue-800 ml-2 underline"
                  >
                    Thu gọn
                  </button>
                )}
              </div>
            ) : (
              <span>
                {visibleReceivers.join(', ')}
                {remainingCount > 0 && (
                  <button
                    onClick={() => setShowAllReceivers(true)}
                    className="text-blue-600 hover:text-blue-800 ml-2 underline"
                  >
                    +{remainingCount} others
                  </button>
                )}
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600 ml-4">
            {transaction.sendDate
              ? new Date(transaction.sendDate).toLocaleDateString("vi-VN")
              : "Chưa gửi"}
          </div>
        </div>

        {/* Content Section */}
        <div className="border border-gray-300 p-6 bg-white min-h-[400px]">
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: transaction.body }}
          />
        </div>
      </div>
    </div>
  );
}