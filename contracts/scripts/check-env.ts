import * as dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

async function checkEnvironment() {
  console.log("🔍 Проверка окружения для деплоя...\n");

  let hasErrors = false;

  // 1. Проверка Private Key
  console.log("📝 Проверка Private Key...");
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

  if (!privateKey || privateKey === "0x0000000000000000000000000000000000000000000000000000000000000000") {
    console.error("❌ DEPLOYER_PRIVATE_KEY не настроен!");
    console.error("   Откройте .env файл и добавьте ваш private key");
    hasErrors = true;
  } else if (!privateKey.startsWith("0x") || privateKey.length !== 66) {
    console.error("❌ DEPLOYER_PRIVATE_KEY имеет неверный формат!");
    console.error("   Должен быть: 0x + 64 hex символа");
    console.error("   Текущая длина:", privateKey.length);
    hasErrors = true;
  } else {
    try {
      const wallet = new ethers.Wallet(privateKey);
      console.log("✅ Private Key валиден");
      console.log("   Адрес деплоера:", wallet.address);
      console.log("   ⚠️  НИКОГДА не делитесь этим ключом!\n");
    } catch (error) {
      console.error("❌ Private Key невалиден:", error);
      hasErrors = true;
    }
  }

  // 2. Проверка RPC URLs
  console.log("🌐 Проверка RPC URLs...");
  const sepoliaRpc = process.env.SEPOLIA_RPC_URL;
  const mainnetRpc = process.env.MAINNET_RPC_URL;

  if (!sepoliaRpc || sepoliaRpc.includes("YOUR_INFURA_KEY") || sepoliaRpc.includes("YOUR-API-KEY")) {
    console.error("❌ SEPOLIA_RPC_URL не настроен!");
    console.error("   Получите Infura Project ID на https://infura.io");
    hasErrors = true;
  } else {
    console.log("✅ Sepolia RPC URL:", sepoliaRpc.substring(0, 50) + "...");
  }

  if (!mainnetRpc || mainnetRpc.includes("YOUR_INFURA_KEY") || mainnetRpc.includes("YOUR-API-KEY")) {
    console.log("⚠️  MAINNET_RPC_URL не настроен");
    console.log("   (Нужен только для деплоя в mainnet)\n");
  } else {
    console.log("✅ Mainnet RPC URL:", mainnetRpc.substring(0, 50) + "...\n");
  }

  // 3. Проверка подключения к сети
  if (sepoliaRpc && !sepoliaRpc.includes("YOUR_INFURA_KEY")) {
    console.log("🔌 Проверка подключения к Sepolia...");
    try {
      const provider = new ethers.JsonRpcProvider(sepoliaRpc);
      const blockNumber = await provider.getBlockNumber();
      console.log("✅ Подключение к Sepolia успешно");
      console.log("   Текущий блок:", blockNumber);

      // 4. Проверка баланса
      if (privateKey && privateKey.startsWith("0x") && privateKey.length === 66) {
        const wallet = new ethers.Wallet(privateKey, provider);
        const balance = await provider.getBalance(wallet.address);
        const ethBalance = ethers.formatEther(balance);

        console.log("\n💰 Баланс кошелька:", ethBalance, "SepoliaETH");

        if (parseFloat(ethBalance) === 0) {
          console.error("❌ Баланс равен 0!");
          console.error("   Получите тестовые ETH:");
          console.error("   - https://sepoliafaucet.com");
          console.error("   - https://www.alchemy.com/faucets/ethereum-sepolia");
          hasErrors = true;
        } else if (parseFloat(ethBalance) < 0.1) {
          console.warn("⚠️  Баланс низкий! Рекомендуется минимум 0.5 ETH для деплоя");
          console.warn("   Текущий баланс может быть недостаточен");
        } else {
          console.log("✅ Баланс достаточен для деплоя");
        }
      }
    } catch (error: any) {
      console.error("❌ Ошибка подключения к Sepolia:");
      console.error("  ", error.message);
      console.error("   Проверьте SEPOLIA_RPC_URL в .env файле");
      hasErrors = true;
    }
  }

  // 5. Проверка Etherscan API Key
  console.log("\n🔍 Проверка Etherscan API Key...");
  const etherscanKey = process.env.ETHERSCAN_API_KEY;

  if (!etherscanKey || etherscanKey === "YOUR_ETHERSCAN_API_KEY") {
    console.warn("⚠️  ETHERSCAN_API_KEY не настроен");
    console.warn("   Получите ключ на https://etherscan.io/myapikey");
    console.warn("   (Нужен для верификации контрактов)\n");
  } else {
    console.log("✅ Etherscan API Key настроен");
    console.log("   Key:", etherscanKey.substring(0, 10) + "..." + "\n");
  }

  // 6. Итоговая проверка
  console.log("═".repeat(50));
  if (hasErrors) {
    console.error("\n❌ Обнаружены ошибки в настройках!");
    console.error("   Исправьте их перед деплоем.\n");
    console.error("📚 Инструкции: contracts/DEPLOYMENT_GUIDE.md\n");
    process.exit(1);
  } else {
    console.log("\n✨ Все проверки пройдены успешно!");
    console.log("🚀 Готов к деплою в Sepolia testnet!\n");
    console.log("Следующие шаги:");
    console.log("  1. pnpm deploy:sepolia");
    console.log("  2. Протестируйте контракты");
    console.log("  3. Верифицируйте на Etherscan\n");
  }
}

// Запуск проверки
checkEnvironment().catch((error) => {
  console.error("\n💥 Критическая ошибка:", error);
  process.exit(1);
});
