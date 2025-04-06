# Maitrix Faucet Bot

Bu bot, Maitrix ağı için çoklu EVM cüzdanlar oluşturup faucet'ten token talep etmenizi sağlar.

## Özellikler

- İstenen sayıda EVM cüzdan oluşturma
- Her cüzdan için Maitrix Faucet'ten otomatik token talebi
- Tam sonuç raporlama ve dosyaya kaydetme

## Kurulum

1. Bu repoyu klonlayın:
```
git clone https://github.com/getcakedieyoungx/maitrix-faucet-bot.git
cd maitrix-faucet-bot
```

2. Gerekli paketleri yükleyin:
```
npm install
```

## Kullanım

Botu çalıştırmak için:

```
npm start
```

1. Bot kaç adet cüzdan oluşturmak istediğinizi soracaktır.
2. İstenen sayıda cüzdan oluşturulduktan sonra, faucet'ten token talep etmek isteyip istemediğinizi onaylamanız istenecektir.
3. Onay vermeniz durumunda, bot tüm cüzdanlar için otomatik olarak token taleplerini gerçekleştirecektir.
4. İşlem tamamlandığında, sonuçlar ekranda gösterilecek ve bir JSON dosyasına kaydedilecektir.

## Dosyalar

- `index.js`: Ana program kodu
- `package.json`: Proje bağımlılıkları ve npm script'leri

## Gereksinimler

- Node.js 14+
- NPM veya Yarn
- İnternet bağlantısı

## Not

Bu bot, Maitrix testnet faucet'i ile çalışmak üzere tasarlanmıştır. Yalnızca eğitim amaçlı kullanılmalıdır. API'nin aşırı kullanımı durumunda, IP adresinizin geçici olarak engellenebileceğini unutmayın.