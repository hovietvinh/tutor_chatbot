# Dự án: Tutor Chatbot
## Đây là dự án Tutor Chatbot được phát triển bởi nhóm 5 thành viên. Dự án bao gồm một chatbot hỗ trợ học tập với giao diện người dùng (Frontend) và hệ thống backend tích hợp.
## Tổng quan
Dự án bao gồm 3 phần chính:
BE_chatbot: Backend xử lý logic chatbot (Python).

BE_Nodejs (be-v1): Backend quản lý cơ sở dữ liệu (Node.js).

FE (fe-v1): Giao diện người dùng (React).

## Yêu cầu trước khi bắt đầu
Cài đặt Python (phiên bản 3.8 trở lên).

Cài đặt Node.js (phiên bản 16 trở lên).

Cài đặt Git Bash (khuyến nghị cho terminal trên Windows).

Trình duyệt web (Chrome, Firefox, v.v.).

## Hướng dẫn cài đặt và chạy dự án
Làm theo các bước dưới đây để chạy dự án một cách mượt mà. Lưu ý: Luôn chạy các phần theo thứ tự: BE_chatbot → BE_Nodejs → FE.
1. Cài đặt và chạy BE_chatbot
Mở terminal (Git Bash trên Windows) và di chuyển đến thư mục BE_chatbot

bash: cd BE_chatbot

Tạo và kích hoạt môi trường ảo (virtual environment)

bash: pip install virtualenv
virtualenv venv
source venv/Scripts/activate  # Trên Windows
hoặc: source venv/bin/activate  # Trên macOS/Linux

Nếu terminal hiển thị (venv) trước dấu nhắc lệnh, môi trường ảo đã được kích hoạt thành công.

Cài đặt các thư viện cần thiết:

bash: pip install -r requirements.txt

Chạy logic chatbot:

bash: python app.py

2. Cài đặt và chạy BE_Nodejs
Mở một terminal mới và di chuyển đến thư mục BE_Nodejs/be-v1:

bash: cd BE_Nodejs/be-v1

Cài đặt các module Node.js:

bash: npm install

Khởi động cơ sở dữ liệu:

bash: npm start

3. Cài đặt và chạy FE
Mở một terminal mới và di chuyển đến thư mục FE/fe-v1:

bash: cd FE/fe-v1

Cài đặt các module Node.js:

bash: npm install

Khởi động giao diện React:

bash: npm start

Trình duyệt sẽ tự động mở giao diện tại http://localhost:3000 (hoặc cổng tương tự).

## Lưu ý quan trọng
Thứ tự chạy: Luôn chạy BE_chatbot trước, sau đó đến BE_Nodejs, và cuối cùng là FE.

## Nếu gặp lỗi, kiểm tra:
Đã kích hoạt môi trường ảo (venv) cho BE_chatbot.

Các cổng (port) không bị chiếm dụng (thường là 5000 cho backend, 3000 cho frontend).

Đã cài đặt đầy đủ Python và Node.js.

Để dừng dự án, nhấn Ctrl + C trong terminal tương ứng.

