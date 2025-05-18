"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Transaction {
  id: number;
  sender: string;
  receivers: string;
  emailTemplateId: number | null;
  title: string;
  body: string;
  plantDate: string | null;
  sendDate: string | null;
  createdBy: string;
  emailTemplate?: {
    id: number;
    name: string;
    title: string;
    body: string;
  };
}

export default function TransactionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get<Transaction>(
          `http://localhost:3001/transactions/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTransaction(response.data);
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Chi tiết Email Đã Gửi</h1>
        <Button className="cursor-pointer" onClick={() => router.push("/transactions")}>
          Quay lại danh sách
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <strong>Danh sách người nhận:</strong>
              <p>{transaction.receivers}</p>
            </div>
            <div>
              <strong>Tiêu đề:</strong>
              <p>{transaction.title}</p>
            </div>
            <div>
              <strong>Tên template:</strong>
              <p>{transaction.emailTemplate?.name ?? "Không có template"}</p>
            </div>
            <div>
              <strong>Ngày gửi:</strong>
              <p>
                {transaction.sendDate
                  ? new Date(transaction.sendDate).toLocaleString("vi-VN", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })
                  : "Chưa gửi"}
              </p>
            </div>
            <div>
              <strong>Nội dung email:</strong>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: transaction.body }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}