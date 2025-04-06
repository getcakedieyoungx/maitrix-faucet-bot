const ethers = require('ethers');
const axios = require('axios');
const readline = require('readline-sync');
const chalk = require('chalk');
const fs = require('fs');

// Ana sınıf
class MaitrixFaucetBot {
  constructor() {
    this.wallets = [];
    this.results = {
      success: 0,
      failed: 0,
      transactions: []
    };
    
    // Faucet API detayları
    this.apiUrl = 'https://app.x-network.io/maitrix-usde/faucet';
    this.referrer = 'https://app.testnet.themaitrix.ai/';
    this.origin = 'https://app.testnet.themaitrix.ai';
    
    // Gecikme süresi (ms)
    this.delay = 2000;
  }

  // Belirtilen sayıda cüzdan oluşturur
  generateWallets(count) {
    console.log(chalk.blue(`\n${count} adet yeni EVM cüzdan oluşturuluyor...\n`));
    
    for (let i = 0; i < count; i++) {
      const wallet = ethers.Wallet.createRandom();
      this.wallets.push({
        privateKey: wallet.privateKey,
        address: wallet.address,
        status: 'oluşturuldu',
        txHash: null
      });
      console.log(chalk.green(`Cüzdan ${i+1}:`) + chalk.gray(` ${wallet.address}`));
    }
    
    console.log(chalk.blue(`\nToplam ${this.wallets.length} adet cüzdan oluşturuldu.\n`));
    return this.wallets;
  }

  // Tüm cüzdanlar için faucet'ten token talep eder
  async claimTokensForAllWallets() {
    console.log(chalk.yellow('\nFaucet istekleri başlatılıyor...\n'));
    
    for (let i = 0; i < this.wallets.length; i++) {
      const wallet = this.wallets[i];
      console.log(chalk.cyan(`[${i+1}/${this.wallets.length}] İstek gönderiliyor: ${wallet.address}`));
      
      try {
        const result = await this.claimTokens(wallet.address);
        wallet.status = 'başarılı';
        wallet.txHash = result.txHash;
        wallet.amount = result.amount;
        
        this.results.success++;
        this.results.transactions.push({
          address: wallet.address,
          txHash: result.txHash,
          amount: result.amount
        });
        
        console.log(chalk.green(`  ✓ Başarılı! Tx: ${result.txHash} | Miktar: ${result.amount} token`));
      } catch (error) {
        wallet.status = 'başarısız';
        this.results.failed++;
        
        console.log(chalk.red(`  ✗ Başarısız: ${error.message || 'Bilinmeyen hata'}`));
      }
      
      // Her istek arasında bekle
      if (i < this.wallets.length - 1) {
        console.log(chalk.gray(`  Sonraki istek için ${this.delay/1000} saniye bekleniyor...`));
        await this.sleep(this.delay);
      }
    }
  }

  // Belirli bir cüzdan için token talep eder
  async claimTokens(address) {
    try {
      const response = await axios.post(this.apiUrl, 
        { address: address }, 
        {
          headers: {
            'Content-Type': 'application/json',
            'Origin': this.origin,
            'Referer': this.referrer,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'
          }
        }
      );
      
      if (response.data && response.data.code === 200) {
        return {
          txHash: response.data.data.txHash,
          amount: response.data.data.amount
        };
      } else {
        throw new Error(response.data?.message || 'İstek başarısız');
      }
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data?.message || `HTTP Hatası: ${error.response.status}`);
      } else {
        throw new Error(error.message || 'Bilinmeyen hata');
      }
    }
  }

  // Belirtilen süre kadar bekler
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Sonuçları dosyaya kaydeder
  saveResultsToFile() {
    const fileName = `maitrix_faucet_results_${new Date().toISOString().replace(/:/g, '-')}.json`;
    const data = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.wallets.length,
        success: this.results.success,
        failed: this.results.failed
      },
      wallets: this.wallets
    };
    
    fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
    console.log(chalk.blue(`\nSonuçlar kaydedildi: ${fileName}`));
    
    return fileName;
  }

  // Özet bilgileri gösterir
  printSummary() {
    console.log(chalk.yellow('\n===== İŞLEM SONUÇLARI ====='));
    console.log(chalk.white(`Toplam cüzdan: ${this.wallets.length}`));
    console.log(chalk.green(`Başarılı: ${this.results.success}`));
    console.log(chalk.red(`Başarısız: ${this.results.failed}`));
    console.log(chalk.yellow('==========================\n'));
  }
}

// Ana fonksiyon
async function main() {
  console.log(chalk.yellow('=============================================='));
  console.log(chalk.yellow('        MAITRIX FAUCET BOT - v1.0.0          '));
  console.log(chalk.yellow('==============================================\n'));
  
  const bot = new MaitrixFaucetBot();
  
  // Kullanıcıdan kaç cüzdan oluşturulacağını iste
  const walletCount = readline.question(chalk.cyan('Kaç adet cüzdan oluşturmak istiyorsunuz? '));
  
  if (isNaN(walletCount) || walletCount <= 0) {
    console.log(chalk.red('Lütfen geçerli bir sayı girin!'));
    return;
  }
  
  // Cüzdanları oluştur
  bot.generateWallets(parseInt(walletCount));
  
  // Kullanıcıya devam etmek isteyip istemediğini sor
  const confirm = readline.question(chalk.cyan(`\n${walletCount} cüzdan için Maitrix Faucet'ten token talep etmek istiyor musunuz? (E/H) `));
  
  if (confirm.toLowerCase() !== 'e') {
    console.log(chalk.red('\nİşlem iptal edildi.'));
    return;
  }
  
  // Token talep işlemini başlat
  await bot.claimTokensForAllWallets();
  
  // Sonuçları göster ve kaydet
  bot.printSummary();
  const fileName = bot.saveResultsToFile();
  
  console.log(chalk.green('\nİşlem tamamlandı!'));
}

// Programı çalıştır
main().catch(err => {
  console.error(chalk.red('Bir hata oluştu:'), err);
});