# Варианты для получения актуальных данных в реальном времени

## Проблема
OpenAI (GPT-4o-mini) имеет ограниченные знания и не имеет доступа к интернету в реальном времени. Для получения актуальных данных о датах поступления, требованиях и программах нужны альтернативные решения.

## Варианты решения

### 1. **Google Custom Search API** (Рекомендуется)
- **Плюсы**: 
  - Официальный API от Google
  - Актуальные результаты поиска
  - Можно настроить поиск только по университетским сайтам
- **Минусы**: 
  - Платный (100 запросов/день бесплатно, затем $5 за 1000 запросов)
  - Требует настройки Custom Search Engine
- **Использование**: 
  ```typescript
  const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}`;
  ```

### 2. **SerpAPI** (Простое решение)
- **Плюсы**: 
  - Простой в использовании
  - Хорошие результаты
  - 100 бесплатных запросов/месяц
- **Минусы**: 
  - Платный после лимита ($50/5000 запросов)
- **Использование**: 
  ```typescript
  const response = await fetch(`https://serpapi.com/search.json?engine=google&q=${query}&api_key=${SERPAPI_KEY}`);
  ```

### 3. **Bing Search API**
- **Плюсы**: 
  - Microsoft API
  - 1000 бесплатных запросов/месяц
- **Минусы**: 
  - Менее популярен чем Google
- **Использование**: 
  ```typescript
  const response = await fetch(`https://api.bing.microsoft.com/v7.0/search?q=${query}`, {
    headers: { 'Ocp-Apim-Subscription-Key': BING_API_KEY }
  });
  ```

### 4. **OpenAI с Web Browsing** (если доступно)
- **Плюсы**: 
  - Использует существующую инфраструктуру
  - Может искать в интернете
- **Минусы**: 
  - Требует модель с web browsing (не все модели поддерживают)
  - Медленнее и дороже

### 5. **Комбинированный подход** (Лучший вариант)
Использовать комбинацию:
1. **Веб-поиск API** (Google/SerpAPI) для получения актуальных данных
2. **OpenAI** для структурирования и анализа данных
3. **Локальная база данных** для кэширования популярных университетов

## Рекомендуемая архитектура

```typescript
// 1. Поиск актуальных данных через веб-API
async function searchUniversityData(university: string, program: string) {
  const query = `${university} ${program} admission requirements 2025`;
  const results = await serpApi.search(query);
  return extractData(results);
}

// 2. Использование OpenAI для структурирования
async function structureData(rawData: any) {
  const prompt = `Extract admission requirements, deadlines, and program structure from: ${rawData}`;
  return await openai.chat.completions.create({...});
}

// 3. Кэширование в локальной БД
async function getUniversityData(university: string) {
  // Проверяем кэш
  const cached = await db.get(university);
  if (cached && !isExpired(cached)) return cached;
  
  // Получаем свежие данные
  const fresh = await searchUniversityData(university);
  await db.set(university, fresh);
  return fresh;
}
```

## Реализация для проекта

### Шаг 1: Добавить SerpAPI
```bash
npm install serpapi
```

### Шаг 2: Создать функцию поиска
```typescript
// lib/webSearch.ts
import { getJson } from "serpapi";

export async function searchUniversityAdmissionInfo(
  university: string, 
  program: string, 
  country: string
) {
  const query = `${university} ${program} admission requirements deadlines ${country} 2025`;
  
  const results = await getJson({
    engine: "google",
    q: query,
    api_key: process.env.SERPAPI_KEY,
    num: 5
  });
  
  return results.organic_results;
}
```

### Шаг 3: Интегрировать с OpenAI
```typescript
// lib/openai.ts
import { searchUniversityAdmissionInfo } from "./webSearch";

export async function generateAdmissionPlan(input: UserInput) {
  // Для каждого университета ищем актуальные данные
  const searchResults = await Promise.all(
    input.countries.map(country => 
      searchUniversityAdmissionInfo("", input.programs[0], country)
    )
  );
  
  // Передаем результаты в OpenAI для структурирования
  const prompt = `Based on these search results: ${JSON.stringify(searchResults)}, generate admission plan...`;
  // ...
}
```

## Стоимость

- **Google Custom Search**: ~$5 за 1000 запросов
- **SerpAPI**: $50 за 5000 запросов (или 100 бесплатно/месяц)
- **Bing Search**: 1000 бесплатно/месяц, затем $4 за 1000

## Рекомендация

Для MVP использовать **SerpAPI** с бесплатным лимитом (100 запросов/месяц), затем перейти на платный план при необходимости.
