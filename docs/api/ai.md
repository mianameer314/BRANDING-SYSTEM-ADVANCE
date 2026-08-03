# AI Content Assistant API Reference

Base Path: `/api/v1/ai`

The AI Content Assistant uses OpenRouter models to automatically generate structured drafts for Blogs, Projects, News, Case Studies, and Insights directly inside the Admin form editors.

---

## 1. Generate Structured Content Draft

`POST /api/v1/ai/generate`

Generate a fully structured content payload based on a topic prompt.

* **Authentication Required**: Yes (`Bearer <access_token>`)
* **Permission Required**: `create`
* **Rate Limit**: 20 requests per hour (`RATE_LIMIT_AI_GENERATE`)

### Request Body (`application/json`)

| Field | Type | Required | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `content_type` | `string` | Yes | `blog`, `project`, `news`, `insight`, `case_study` | Content model target |
| `prompt` | `string` | Yes | Min 5 chars | Topic description or outline |
| `tone` | `string` | No | Default `professional` | `professional`, `technical`, `engaging`, `formal` |
| `target_audience` | `string` | No | Default `general` | Target reader persona |

#### Example Request
```json
{
  "content_type": "blog",
  "prompt": "Create an article on microservices observability with Prometheus and OpenTelemetry",
  "tone": "technical",
  "target_audience": "DevOps Engineers"
}
```

### Success Response (`200 OK`)

```json
{
  "title": "Microservices Observability: OpenTelemetry & Prometheus in 2026",
  "excerpt": "A practical guide to implementing distributed tracing and metrics in cloud-native applications.",
  "content": "<h2>Introduction</h2><p>Observability is critical for modern distributed systems...</p>",
  "category": "DevOps",
  "tags": ["opentelemetry", "prometheus", "microservices"],
  "generated_at": "2026-07-22T08:45:00Z"
}
```

### Error Responses
* `400 Bad Request`: OpenRouter API key unconfigured or invalid model response.
* `429 Too Many Requests`: Exceeded 20 AI generations per hour quota.
