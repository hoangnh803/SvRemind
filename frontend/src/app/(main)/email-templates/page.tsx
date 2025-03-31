/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Editor } from "@tinymce/tinymce-react";

// Định nghĩa interface cho Email Template
interface EmailTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
}

export default function EmailTemplatePage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    body: "",
  });

  // Lấy danh sách template từ API
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get<EmailTemplate[]>(
          "http://localhost:3001/email-templates",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setTemplates(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách template:", error);
      }
    };
    fetchTemplates();
  }, []);

  // Mở pop-up để tạo template mới
  const handleCreateTemplate = () => {
    setCurrentTemplate(null);
    setFormData({ name: "", title: "", body: "" });
    setIsPopupOpen(true);
  };

  // Mở pop-up để chỉnh sửa template
  const handleEditTemplate = (template: EmailTemplate) => {
    setCurrentTemplate(template);
    setFormData({
      name: template.name,
      title: template.title,
      body: template.body,
    });
    setIsPopupOpen(true);
  };

  // Xử lý khi thay đổi giá trị trong form
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý khi thay đổi nội dung trong TinyMCE
  const handleEditorChange = (content: string) => {
    setFormData((prev) => ({ ...prev, body: content }));
  };

  // Lưu template (tạo mới hoặc chỉnh sửa)
  const handleSaveTemplate = async () => {
    if (!formData.name || !formData.title || !formData.body) {
      alert("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    console.log("Dữ liệu gửi đi:", formData);

    try {
      if (currentTemplate) {
        const response = await axios.put(
          `http://localhost:3001/email-templates/${currentTemplate.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setTemplates((prev) =>
          prev.map((template) =>
            template.id === currentTemplate.id
              ? (response.data as EmailTemplate)
              : template
          )
        );
      } else {
        const response = await axios.post(
          "http://localhost:3001/email-templates",
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setTemplates((prev) => [...prev, response.data as EmailTemplate]);
      }
      setIsPopupOpen(false);
    } catch (error: any) {
      console.error(
        "Lỗi khi lưu template:",
        error.response?.data || error.message
      );
      const errorMessage =
        error.response?.data?.message ||
        "Không thể lưu template. Vui lòng thử lại.";
      alert(errorMessage);
    }
  };

  // Xóa template
  const handleDeleteTemplate = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa template này?")) {
      try {
        await axios.delete(`http://localhost:3001/email-templates/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setTemplates((prev) => prev.filter((template) => template.id !== id));
      } catch (error) {
        console.error("Lỗi khi xóa template:", error);
        alert("Không thể xóa template. Vui lòng thử lại.");
      }
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Quản lý Email Template</h1>

      {/* Nút tạo template mới */}
      <div className="mb-4">
        <button
          onClick={handleCreateTemplate}
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Tạo template mới
        </button>
      </div>

      {/* Bảng danh sách template */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Danh sách template</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-200">
              <th className="w-1/24 p-2 border">STT</th>
              <th className="w-1/8 p-2 border">Tên template</th>
              <th className="w-1/8 p-2 border">Tiêu đề email</th>
              <th className="p-2 border">Nội dung email</th>
              <th className="w-1/7 p-2 border">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((template, index) => (
              <tr key={template.id} className="bg-white">
                <td className="p-2 border">{index + 1}</td>
                <td className="p-2 border">{template.name}</td>
                <td className="p-2 border">{template.title}</td>
                <td className="p-2 border">
                  <div
                    className="max-h-20 overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: template.body }}
                  />
                </td>
                <td className="p-2 border">
                  <button
                    onClick={() => handleEditTemplate(template)}
                    className="p-1 px-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2"
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="p-1 px-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pop-up tạo/chỉnh sửa template */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-1/2">
            <h2 className="text-xl font-semibold mb-4">
              {currentTemplate ? "Chỉnh sửa template" : "Tạo template mới"}
            </h2>

            {/* Form tạo/chỉnh sửa template */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Tên template</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                className="p-2 border rounded w-full"
                placeholder="Nhập tên template"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-medium">Tiêu đề email</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                className="p-2 border rounded w-full"
                placeholder="Nhập tiêu đề email (VD: Xin chào {ten})"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-medium">Nội dung email</label>
              <p className="text-sm text-gray-900 mt-1">
                Sử dụng {`{ten}`}, {`{mssv}`}, {`{email}`} để chèn thông tin
                sinh viên.
              </p>
              <Editor
                apiKey="5hpduv8dw5cs809fj9cgji7pofo1uq3bxhtdvaa6tl9jyyns"
                value={formData.body}
                onEditorChange={handleEditorChange}
                init={{
                  height: 300,
                  menubar: false,
                  plugins: [
                    "advlist autolink lists link image charmap print preview anchor",
                    "searchreplace visualblocks code fullscreen",
                    "insertdatetime media table paste code help wordcount",
                  ],
                  toolbar:
                    "undo redo | formatselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",
                  content_style:
                    "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                }}
              />
            </div>

            {/* Nút Hủy và Lưu */}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsPopupOpen(false)}
                className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 mr-2"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveTemplate}
                className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
