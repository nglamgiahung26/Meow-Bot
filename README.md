# Meow-bot Web v1

Bản web đầu tiên: Minecraft-style UI + Discord OAuth2 + danh sách server.

## Chạy

```bash
npm install
```

Tạo `.env` từ `.env.example`, điền:

- DISCORD_CLIENT_ID
- DISCORD_CLIENT_SECRET
- DISCORD_REDIRECT_URI
- SESSION_SECRET

Trong Discord Developer Portal, thêm Redirect URI giống `DISCORD_REDIRECT_URI`.

Sau đó:

```bash
npm start
```

Mở:

`http://localhost:3000`

## Hiện có

- Discord OAuth2
- Xem các server tài khoản có thể quản lý
- Chọn server
- Khung chờ Meow-bot phê duyệt
- 3 mục: CHUNG, LỆNH, TÀI KHOẢN
- Giao diện Minecraft-style

Phần bot approval và các chức năng trong từng mục sẽ nối vào sau khi chốt yêu cầu.
