# Permission Matrix

This document maps all API endpoints to their required permissions and the roles that are granted those permissions.

## Roles
- **super_admin**: `read_content`, `create`, `update`, `delete`, `approve`, `publish`, `interact`, `manage_users`, `view_drafts`, `manage_webhooks`
- **admin**: `read_content`, `create`, `update`, `delete`, `approve`, `publish`, `interact`, `view_drafts`
- **editor**: `read_content`, `create`, `update`, `interact`, `view_drafts`
- **user**: `read_content`, `interact`
- **viewer**: `read_content`

## Endpoints

| Resource       | Action                       | Method | Endpoint                        | Required Permission | Allowed Roles                          |
|----------------|------------------------------|--------|---------------------------------|---------------------|----------------------------------------|
| **Auth**       | Login                        | POST   | `/auth/token`                   | (None)              | (All)                                  |
| **Auth**       | Register                     | POST   | `/auth/register`                | (None)              | (All)                                  |
| **Auth**       | Me                           | GET    | `/auth/me`                      | (None, Authed)      | (All Authed)                           |
| **Auth**       | Generate API Key             | POST   | `/auth/api-keys`                | (None, Authed)      | (All Authed)                           |
| **Users**      | List Users                   | GET    | `/users`                        | `manage_users`      | super_admin                            |
| **Users**      | Get User                     | GET    | `/users/{id}`                   | `manage_users`      | super_admin                            |
| **Users**      | Change Role                  | PUT    | `/users/{id}/role`              | `manage_users`      | super_admin                            |
| **Users**      | Delete User                  | DELETE | `/users/{id}`                   | `manage_users`      | super_admin                            |
| **Blogs**      | List Blogs                   | GET    | `/blogs`                        | (None, view_drafts) | (All) / super_admin, admin, editor (drafts) |
| **Blogs**      | Get Blog                     | GET    | `/blogs/{slug}`                 | (None, view_drafts) | (All) / super_admin, admin, editor (drafts) |
| **Blogs**      | Create Blog                  | POST   | `/blogs`                        | `create`            | super_admin, admin, editor             |
| **Blogs**      | Update Blog                  | PUT    | `/blogs/{id}`                   | `update`            | super_admin, admin, editor             |
| **Blogs**      | Delete Blog                  | DELETE | `/blogs/{id}`                   | `delete`            | super_admin, admin                     |
| **News**       | List News                    | GET    | `/news`                         | (None, view_drafts) | (All) / super_admin, admin, editor (drafts) |
| **News**       | Get News                     | GET    | `/news/{slug}`                  | (None, view_drafts) | (All) / super_admin, admin, editor (drafts) |
| **News**       | Create News                  | POST   | `/news`                         | `create`            | super_admin, admin, editor             |
| **News**       | Update News                  | PUT    | `/news/{id}`                    | `update`            | super_admin, admin, editor             |
| **News**       | Delete News                  | DELETE | `/news/{id}`                    | `delete`            | super_admin, admin                     |
| **Projects**   | List Projects                | GET    | `/projects`                     | (None, view_drafts) | (All) / super_admin, admin, editor (drafts) |
| **Projects**   | Get Project                  | GET    | `/projects/{slug}`              | (None, view_drafts) | (All) / super_admin, admin, editor (drafts) |
| **Projects**   | Create Project               | POST   | `/projects`                     | `create`            | super_admin, admin, editor             |
| **Projects**   | Update Project               | PUT    | `/projects/{id}`                | `update`            | super_admin, admin, editor             |
| **Projects**   | Delete Project               | DELETE | `/projects/{id}`                | `delete`            | super_admin, admin                     |
| **Insights**   | List Insights                | GET    | `/insights`                     | (None, view_drafts) | (All) / super_admin, admin, editor (drafts) |
| **Insights**   | Get Insight                  | GET    | `/insights/{slug}`              | (None, view_drafts) | (All) / super_admin, admin, editor (drafts) |
| **Insights**   | Create Insight               | POST   | `/insights`                     | `create`            | super_admin, admin, editor             |
| **Insights**   | Update Insight               | PUT    | `/insights/{id}`                | `update`            | super_admin, admin, editor             |
| **Insights**   | Delete Insight               | DELETE | `/insights/{id}`                | `delete`            | super_admin, admin                     |
| **Case St.**   | List Case Studies            | GET    | `/case-studies`                 | (None, view_drafts) | (All) / super_admin, admin, editor (drafts) |
| **Case St.**   | Get Case Study               | GET    | `/case-studies/{slug}`          | (None, view_drafts) | (All) / super_admin, admin, editor (drafts) |
| **Case St.**   | Create Case Study            | POST   | `/case-studies`                 | `create`            | super_admin, admin, editor             |
| **Case St.**   | Update Case Study            | PUT    | `/case-studies/{id}`            | `update`            | super_admin, admin, editor             |
| **Case St.**   | Delete Case Study            | DELETE | `/case-studies/{id}`            | `delete`            | super_admin, admin                     |
| **AI**         | Generate Content             | POST   | `/ai/generate`                  | `create`            | super_admin, admin, editor             |
| **Webhooks**   | List Webhooks                | GET    | `/webhooks`                     | `manage_webhooks`   | super_admin                            |
| **Webhooks**   | Get Webhook                  | GET    | `/webhooks/{id}`                | `manage_webhooks`   | super_admin                            |
| **Webhooks**   | Create Webhook               | POST   | `/webhooks`                     | `manage_webhooks`   | super_admin                            |
| **Webhooks**   | Update Webhook               | PUT    | `/webhooks/{id}`                | `manage_webhooks`   | super_admin                            |
| **Webhooks**   | Delete Webhook               | DELETE | `/webhooks/{id}`                | `manage_webhooks`   | super_admin                            |
| **Webhooks**   | Test Webhook                 | POST   | `/webhooks/{id}/test`           | `manage_webhooks`   | super_admin                            |
| **Webhooks**   | Get Webhook Logs             | GET    | `/webhooks/{id}/logs`           | `manage_webhooks`   | super_admin                            |
| **Audit**      | List Content Revisions       | GET    | `/audit/content/.../revisions`  | `view_drafts`       | super_admin, admin, editor             |
| **Audit**      | Restore Revision             | POST   | `/audit/content/.../restore`    | `publish`           | super_admin, admin                     |
| **Audit**      | List Audit Events            | GET    | `/audit/events`                 | `manage_users`      | super_admin                            |
| **Interactions**| Like/Unlike/Favorite/Comment| POST/DEL| `/interactions/...`             | `interact`          | super_admin, admin, editor, user       |
| **Resources**  | Create Resource              | POST   | `/resources`                    | `create`            | super_admin, admin, editor             |
| **Resources**  | Delete Resource              | DELETE | `/resources/{id}`               | `delete`            | super_admin, admin                     |
