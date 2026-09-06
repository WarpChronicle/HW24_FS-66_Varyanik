import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";

async function runFridgeApp() {
  const rl = readline.createInterface({ input, output });
  const fridge = [];

  console.log("Программа для учета продуктов в холодильнике.");
  console.log("Введите продукты в холодильнике.Для завершения введите 'exit', 'выход', 'стоп' или 'stop'.");

  const stopWords = ["exit", "выход", "стоп", "stop"];

  while (true) {
    const name = await rl.question("Введите наименование продукта: ");
    const trimmedName = name.trim();

    if (stopWords.includes(trimmedName.toLowerCase())) {
      break;
    }

    if (trimmedName === "") {
      console.log(
        "Наименование продукта не может быть пустым. Попробуйте снова.",
      );
      continue;
    }

    const countInput = await rl.question(
      `Введите количество продукта "${trimmedName}": `,
    );
    const count = parseInt(countInput.trim(), 10);  
    const validCount = Number.isNaN(count) ? 0 : count;
    

    const existingIndex = fridge.findIndex(
      (item) => item.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (validCount === 0) {
      if (existingIndex !== -1) {
        fridge.splice(existingIndex, 1);
        console.log(`Продукт "${trimmedName}" удален из списка.`);
      } else {
        console.log(`Продукта "${trimmedName}" не было в списке.`);
      }
    } else {
      if (existingIndex !== -1) {
        fridge[existingIndex].count = validCount;
        console.log(`Количество продукта "${trimmedName}" изменено на ${validCount}.`);
      } else {
        fridge.push({ name: trimmedName, count: validCount });
        console.log("Продукт добавлен:", { name: trimmedName, count: validCount });
      }
    }
  }

  rl.close(); 

  const filePath = path.resolve("fridge.csv");

  try {
    const csvHeader = "Наименование,Количество\n";
    const csvRows = fridge.map((item) => `${item.name},${item.count}`).join("\n");
    const csvContent = csvHeader + csvRows;

    await writeFile(filePath, csvContent, "utf-8");
    console.log(`Данные о продуктах сохранены в CSV файл: ${filePath}`);

    console.log("\nСчитываем данные из CSV файла...");
    const fileData = await readFile(filePath, "utf-8");
    console.log("Содержимое CSV файла:");
    console.log(fileData);

    const lines = fileData.trim().split("\n").slice(1);
    const parsedProducts = lines
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const [name, countStr] = line.split(",");
        return { name, count: parseInt(countStr, 10) };
      });

    console.log("\n1. Список продуктов в холодильнике:");
    parsedProducts.forEach((product) => {
      console.log(`- ${product.name}: ${product.count}`);
    });

    console.log("\n2. Таблица продуктов:");
    console.table(parsedProducts);
  } catch (error) {
    console.error("Ошибка при работе с CSV файлом:", error.message);
  }
}

runFridgeApp();