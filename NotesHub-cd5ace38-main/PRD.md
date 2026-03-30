# PRODUCT REQUIREMENTS DOCUMENT

## EXECUTIVE SUMMARY

**Product Name:** NotesHub

**Product Vision:** NotesHub is a powerful, searchable knowledge management system that helps users organize, tag, and quickly retrieve their notes across multiple collections. It combines the simplicity of note-taking with advanced search capabilities and flexible organization through collections and tags.

**Core Purpose:** Solves the problem of information overload and poor note discoverability. Users often create many notes but struggle to find them later. NotesHub provides full-text search, multi-dimensional filtering (collections, tags), and intelligent organization to make knowledge retrieval instant and effortless.

**Target Users:** Knowledge workers, students, researchers, and professionals who create substantial amounts of written content and need to organize and retrieve information quickly across different projects or topics.

**Key MVP Features:**
- User Authentication - System/Configuration
- Collections Management - User-Generated Content
- Notes Management - User-Generated Content
- Tagging System - Configuration/User-Generated
- Full-Text Search with Filters - System
- Analytics Dashboard - System Data

**Platform:** Web application (responsive, accessible via browser on desktop, tablet, and mobile devices)

**Complexity Assessment:** Moderate
- State Management: Backend with frontend caching
- External Integrations: None (reduces complexity)
- Business Logic: Moderate (search indexing, multi-collection relationships, aggregation pipelines)

**MVP Success Criteria:**
- Users can create, organize, and search notes across collections
- Full-text search returns relevant results within 2 seconds
- Multi-filter search (collection + tag + search term) works correctly
- Dashboard aggregations display accurate statistics
- All CRUD operations function without errors
- Responsive design works on mobile and desktop

---

## 1. USERS & PERSONAS

**Primary Persona:**
- **Name:** "Alex the Knowledge Worker"
- **Context:** Product manager at a tech company who takes extensive meeting notes, project documentation, and personal learning notes. Works across 5-8 active projects simultaneously and needs to reference past notes frequently during meetings and planning sessions.
- **Goals:** Quickly find relevant notes during meetings, organize notes by project/topic, tag notes for cross-project themes (like "decisions", "action-items", "research"), and maintain a searchable knowledge base that grows over time.
- **Pain Points:** Current tools (Google Docs, Notion) become cluttered and slow. Search is poor. Notes get lost across folders. Can't easily see notes that span multiple projects. Wastes 10-15 minutes per day hunting for information.

**Secondary Persona:**
- **Name:** "Sam the Student"
- **Context:** Graduate student managing research notes, course materials, and thesis work across multiple subjects. Needs to quickly reference sources, quotes, and concepts while writing papers.
- **Goals:** Organize notes by course/research topic, tag by concept for cross-referencing, search through hundreds of notes instantly, and pin important reference materials for quick access.
- **Pain Points:** Paper notes get lost, digital notes scattered across apps, can't find that one quote or source when needed, no way to see connections between topics.

---

## 2. FUNCTIONAL REQUIREMENTS

### 2.1 Core MVP Features (Priority 0)

**FR-001: User Authentication**
- **Description:** Secure user registration, login, session management, and profile access
- **Entity Type:** System/Configuration
- **Operations:** Register, Login, View profile, Edit profile, Reset password, Logout
- **Key Rules:** Passwords hashed, sessions persist across browser sessions, email validation required
- **Acceptance:** Users can register with email/password, login securely, maintain authenticated sessions, and manage their profile

**FR-002: Collections Management**
- **Description:** Organizational containers that group related notes (projects, topics, courses)
- **Entity Type:** User-Generated Content
- **Operations:** Create, View, Rename, Delete, List/Search
- **Key Rules:** Collection names unique per user; deleting collection hard-deletes all contained notes; users view all collections in sidebar
- **Acceptance:** Users can create collections, rename them, delete them (with confirmation), and see all their collections listed

**FR-003: Notes Management**
- **Description:** Core content creation with title, body, tags, collection assignment, and pin status
- **Entity Type:** User-Generated Content
- **Operations:** Create, View, Edit, Delete, Pin/Unpin, Move between collections, Assign/remove tags, List/Search
- **Key Rules:** Notes belong to multiple collections; pinned notes appear at top of lists and home page; notes require title (min 1 char)
- **Acceptance:** Users can create notes with title/content, edit them, delete them, pin important ones, assign to multiple collections, and tag them

**FR-004: Tagging System**
- **Description:** Flexible labeling system with predefined system tags and user-created custom tags
- **Entity Type:** Configuration/User-Generated
- **Operations:** Create custom tags, View all tags, Assign to notes, Remove from notes, View tag usage statistics
- **Key Rules:** System provides predefined tags (decisions, action-items, research, ideas, reference); users create custom tags freely; tag names case-insensitive and unique
- **Acceptance:** Users can select from predefined tags, create new custom tags while editing notes, and see tag suggestions based on existing tags

**FR-005: Full-Text Search with Advanced Filters**
- **Description:** MongoDB text-indexed search across note titles and content with multi-dimensional filtering
- **Entity Type:** System
- **Operations:** Search by text, Filter by collection(s), Filter by tag(s), Sort by relevance/date, Toggle AND/OR logic, Paginate results
- **Key Rules:** Search uses MongoDB text index; filters use AND/OR logic based on user toggle; results paginated at 20 per page
- **Acceptance:** Users can search notes by text, apply collection and tag filters, toggle between AND/OR filter logic, sort results, and paginate through matches

**FR-006: Analytics Dashboard**
- **Description:** Aggregated statistics showing note activity and organization patterns
- **Entity Type:** System Data
- **Operations:** View statistics, Export data
- **Key Rules:** Uses MongoDB aggregation pipeline; updates in real-time; shows total notes, notes per collection, most used tags (top 10), recent activity (last 10 note creations/edits)
- **Acceptance:** Users see accurate counts of total notes, breakdown by collection, top 10 most-used tags with counts, and last 10 note activities with timestamps

---

## 3. USER WORKFLOWS

### 3.1 Primary Workflow: Create, Organize, and Retrieve Notes

**Trigger:** User needs to capture information and retrieve it later
**Outcome:** User successfully creates organized notes and finds them instantly via search

**Steps:**
1. User logs in and lands on dashboard showing pinned notes, recent notes, and statistics
2. User clicks "New Note" button, enters title and content, assigns to one or more collections, adds tags (predefined or custom), and saves
3. System creates note with text indexing, updates collection counts, and shows success confirmation
4. User later needs to find note, enters search term in search bar, applies collection and/or tag filters, toggles AND/OR logic if using multiple filters
5. System returns ranked results within 2 seconds, user clicks desired note to view full content
6. User can edit note, move to different collections, add/remove tags, or pin it for quick access
7. User views dashboard to see note distribution across collections and most-used tags

### 3.2 Key Supporting Workflows

**Create Collection:** User clicks "New Collection" in sidebar → enters collection name → saves → collection appears in sidebar list

**Rename Collection:** User clicks edit icon on collection → enters new name → saves → collection name updates everywhere

**Delete Collection:** User clicks delete icon → confirms deletion warning (notes will be deleted) → collection and all notes removed

**Pin/Unpin Note:** User opens note → clicks pin icon → note moves to top of lists and appears on home page

**Move Note Between Collections:** User opens note in edit mode → selects/deselects collections from multi-select dropdown → saves → note appears in selected collections

**Create Custom Tag:** User types new tag name in tag input field while editing note → presses enter → tag created and assigned to note

**Filter Search Results:** User enters search term → clicks filter dropdowns → selects collections and/or tags → toggles AND/OR logic → results update in real-time

---

## 4. BUSINESS RULES

### 4.1 Entity Lifecycle Rules

**User:**
- **Type:** System/Configuration
- **Creation:** Anyone can register with valid email and password
- **Editing:** Owner can edit profile information and change password
- **Deletion:** Owner can delete account (soft delete with 30-day recovery period)

**Collection:**
- **Type:** User-Generated Content
- **Creation:** All authenticated users can create collections
- **Editing:** Owner can rename collections
- **Deletion:** Owner can delete collections - HARD DELETE including all contained notes (requires confirmation)

**Note:**
- **Type:** User-Generated Content
- **Creation:** All authenticated users can create notes
- **Editing:** Owner can edit title, content, tags, collections, and pin status
- **Deletion:** Owner can delete notes - soft delete (archived for 30 days before permanent deletion)

**Tag:**
- **Type:** Configuration/User-Generated
- **Creation:** System provides predefined tags; users can create custom tags
- **Editing:** Users cannot rename tags (would break associations); can only create new ones
- **Deletion:** Tags automatically removed when no notes use them; predefined tags persist always

### 4.2 Data Validation Rules

**User:**
- **Required Fields:** email, password, name
- **Field Constraints:** Email must be valid format and unique; password minimum 8 characters with at least one number and one special character; name minimum 2 characters

**Collection:**
- **Required Fields:** name, ownerId
- **Field Constraints:** Name minimum 1 character, maximum 100 characters, unique per user; cannot contain special characters except spaces, hyphens, underscores

**Note:**
- **Required Fields:** title, ownerId, collectionIds (at least one)
- **Field Constraints:** Title minimum 1 character, maximum 200 characters; content maximum 50,000 characters; must belong to at least one collection; tags array maximum 20 tags per note

**Tag:**
- **Required Fields:** name, type (predefined/custom)
- **Field Constraints:** Name minimum 1 character, maximum 50 characters, case-insensitive unique; alphanumeric plus hyphens only; predefined tags cannot be deleted

### 4.3 Access & Process Rules
- Users can only view, edit, and delete their own notes, collections, and custom tags
- Predefined tags are global and visible to all users but cannot be modified
- Search results only include notes owned by the authenticated user
- Pinned notes appear at the top of all note lists and on the home page dashboard
- When a note belongs to multiple collections and one collection is deleted, the note remains in other collections
- When a note belongs to only one collection and that collection is deleted, the note is hard-deleted
- Dashboard statistics update in real-time as users create, edit, or delete notes
- Search queries timeout after 5 seconds to prevent performance issues
- Maximum 1,000 notes per user for MVP (can be increased post-launch)

---

## 5. DATA REQUIREMENTS

### 5.1 Core Entities

**User**
- **Type:** System/Configuration | **Storage:** Backend database (MongoDB)
- **Key Fields:** id, email (unique), passwordHash, name, createdAt, updatedAt, lastLoginAt, preferences (searchLogic: 'AND'|'OR')
- **Relationships:** has many Collections, has many Notes, has many Tags (custom)
- **Lifecycle:** Full CRUD with account deletion (soft delete with 30-day recovery)

**Collection**
- **Type:** User-Generated Content | **Storage:** Backend database (MongoDB)
- **Key Fields:** id, name, ownerId, createdAt, updatedAt, noteCount (computed)
- **Relationships:** belongs to User, has many Notes (many-to-many)
- **Lifecycle:** Create, View, Rename, Delete (hard delete with cascade to notes)

**Note**
- **Type:** User-Generated Content | **Storage:** Backend database (MongoDB)
- **Key Fields:** id, title, content, ownerId, collectionIds (array), tagIds (array), isPinned (boolean), createdAt, updatedAt, deletedAt (soft delete)
- **Relationships:** belongs to User, belongs to many Collections, has many Tags
- **Lifecycle:** Full CRUD with soft delete (30-day archive), pin/unpin, move between collections

**Tag**
- **Type:** Configuration/User-Generated | **Storage:** Backend database (MongoDB)
- **Key Fields:** id, name, type ('predefined'|'custom'), ownerId (null for predefined), usageCount (computed), createdAt, color (default gray)
- **Relationships:** belongs to User (if custom), used by many Notes
- **Lifecycle:** Create (custom tags), View, auto-delete when unused (custom tags only)

**SearchIndex**
- **Type:** System Data | **Storage:** MongoDB text index on Note.title and Note.content
- **Key Fields:** Indexed fields: title (weight: 10), content (weight: 1)
- **Relationships:** Indexes Note entity
- **Lifecycle:** Auto-maintained by MongoDB, rebuilt on schema changes

### 5.2 Data Storage Strategy
- **Primary Storage:** Backend MongoDB database with text indexing
- **Capacity:** Supports 1,000 notes per user (50MB average per user)
- **Persistence:** All data persists in database with automatic backups
- **Audit Fields:** All entities include createdAt, updatedAt; Notes include createdBy, updatedBy, deletedAt
- **Indexing Strategy:** Text index on Note.title and Note.content; compound index on Note.ownerId + Note.isPinned; index on Note.collectionIds and Note.tagIds for filter performance

---

## 6. INTEGRATION REQUIREMENTS

No external integrations required for MVP. All functionality is self-contained within the application.

---

## 7. VIEWS & NAVIGATION

### 7.1 Primary Views

**Dashboard** (`/`) - Displays pinned notes (card grid), recent notes (list of last 10 created/edited), and statistics panel (total notes, notes per collection chart, top tags cloud). Quick access to create new note and search bar at top.

**All Notes** (`/notes`) - Paginated list of all notes with search bar, filter dropdowns (collections, tags), AND/OR toggle, sort options (relevance, updated date), and create button. Each note shows title, content preview (first 150 characters), collections badges, tags, pin status, and updated date.

**Note Detail** (`/notes/:id`) - Full note view with title, complete content, metadata (collections, tags, created/updated dates), and action buttons (edit, delete, pin/unpin). Breadcrumb navigation shows parent collections.

**Note Editor** (`/notes/new` or `/notes/:id/edit`) - Form with title input, plain text content editor with basic formatting (bold, italic, bullet points), multi-select collection dropdown, tag input with autocomplete, pin checkbox, and save/cancel buttons. Shows validation errors inline.

**Collections** (`/collections`) - Sidebar list of all collections with note counts, create/rename/delete actions. Clicking collection filters notes view to show only notes in that collection.

**Search Results** (`/search?q=...`) - Dedicated search results page with query summary, active filters display, result count, paginated note cards showing title and content preview, and refinement options (add/remove filters, change sort).

**Settings** (`/settings`) - User profile editor, password change, search preferences (default AND/OR logic), data export (JSON), and account deletion.

### 7.2 Navigation Structure

**Main Nav:** Dashboard | All Notes | Collections (sidebar) | Search (top bar) | User Menu (profile, settings, logout)
**Default Landing:** Dashboard (shows pinned notes and statistics)
**Mobile:** Hamburger menu for collections sidebar, collapsible filters, responsive card grid for notes

---

## 8. MVP SCOPE & CONSTRAINTS

### 8.1 MVP Success Definition

The MVP is successful when:
- ✅ Users can create and organize notes across multiple collections
- ✅ Full-text search returns relevant results within 2 seconds
- ✅ Multi-filter search (collection + tag + text) works with AND/OR logic
- ✅ Dashboard aggregations show accurate statistics
- ✅ Pinned notes appear at top of lists and on home page
- ✅ All CRUD operations for notes, collections, and tags function correctly
- ✅ Responsive design works on mobile, tablet, and desktop
- ✅ Data persists reliably in MongoDB with proper indexing

### 8.2 In Scope for MVP

Core features included:
- FR-001: User Authentication (register, login, profile management)
- FR-002: Collections Management (create, rename, delete, view)
- FR-003: Notes Management (full CRUD, pin/unpin, multi-collection assignment, tagging)
- FR-004: Tagging System (predefined + custom tags, assignment, removal)
- FR-005: Full-Text Search with Filters (text search, collection filter, tag filter, AND/OR logic, sort, pagination)
- FR-006: Analytics Dashboard (total notes, notes per collection, top tags, recent activity)

### 8.3 Technical Constraints

- **Data Storage:** MongoDB backend database with text indexing
- **Concurrent Users:** Expected 100-500 concurrent users for MVP
- **Performance:** Search queries complete within 2 seconds; page loads under 2 seconds; dashboard aggregations under 1 second
- **Browser Support:** Chrome, Firefox, Safari, Edge (last 2 versions)
- **Mobile:** Responsive design, iOS Safari and Android Chrome support
- **Offline:** Not supported in MVP (requires active internet connection)
- **Search Limits:** Maximum 1,000 results per query; pagination at 20 results per page
- **Note Limits:** 1,000 notes per user; 50,000 characters per note; 20 tags per note

### 8.4 Known Limitations

**For MVP:**
- No real-time collaboration or note sharing between users
- No rich media embedding (images, videos) in note content
- No note versioning or edit history
- No bulk operations (bulk delete, bulk move, bulk tag)
- No advanced search operators (exact phrase, exclude terms, date ranges)
- No export to external formats (PDF, Markdown, Word)
- No mobile native apps (web-only via browser)
- No offline access or sync
- Search result previews show plain text only (no highlighting of matching terms)
- Tags have uniform styling (no custom colors in MVP)

**Future Enhancements:**
- V2 will add note sharing and collaboration features
- V2 will add rich media support and file attachments
- V2 will add version history and change tracking
- V2 will add bulk operations and advanced search syntax
- V2 will add export to multiple formats
- V2 will add search term highlighting in result previews
- V2 will add custom tag colors for visual organization
- V3 will add native mobile apps with offline sync

---

## 9. ASSUMPTIONS & DECISIONS

### 9.1 Platform Decisions
- **Type:** Full-stack web application (React frontend + Python/FastAPI backend + MongoDB)
- **Storage:** Backend MongoDB database with text indexing for search performance
- **Auth:** Backend session-based authentication with secure password hashing

### 9.2 Entity Lifecycle Decisions

**User:** Full CRUD with soft delete (30-day recovery)
- **Reason:** Users need ability to recover accidentally deleted accounts; compliance with data retention policies

**Collection:** Create, Rename, Delete (hard delete with cascade)
- **Reason:** Collections are organizational containers; deleting them should remove contained notes to maintain data integrity and user expectations

**Note:** Full CRUD with soft delete (30-day archive), plus pin/unpin and multi-collection assignment
- **Reason:** Notes are primary user-generated content requiring full lifecycle control; soft delete allows recovery; multi-collection support enables flexible organization

**Tag:** Create (custom), View, auto-delete when unused
- **Reason:** Tags are metadata labels; renaming would break associations; auto-cleanup prevents tag sprawl; predefined tags persist for consistency

**SearchIndex:** System-maintained, no user operations
- **Reason:** MongoDB text index automatically maintained; users interact via search queries, not direct index management

### 9.3 Key Assumptions

1. **Users need multi-collection note assignment**
   - Reasoning: Real-world notes often span multiple projects/topics (e.g., a meeting note relevant to both "Project A" and "Marketing Strategy"). Single-collection constraint would force duplication or arbitrary choices.

2. **Hard delete for collections is acceptable**
   - Reasoning: User explicitly confirmed this behavior in clarifications. Collections are organizational containers, not primary content. Users expect deleting a folder deletes its contents.

3. **Predefined tags improve onboarding and consistency**
   - Reasoning: New users benefit from suggested tags (decisions, action-items, research, ideas, reference). Predefined tags create common vocabulary across users for potential future sharing features.

4. **AND/OR toggle for filters is essential**
   - Reasoning: User explicitly requested this. Different search scenarios require different logic (AND for narrow precision, OR for broad recall). User control maximizes search flexibility.

5. **Pinned notes should appear on home page**
   - Reasoning: User explicitly confirmed this. Pinning is for quick access to important/frequently-referenced notes. Home page placement ensures immediate visibility on login.

6. **2-second search performance is achievable**
   - Reasoning: MongoDB text indexing with proper compound indexes on ownerId, collectionIds, and tagIds should deliver sub-second queries for 1,000 notes per user. 2-second target includes network latency buffer.

7. **Recent activity tracks note creations and edits only**
   - Reasoning: Most valuable activity for users is seeing what notes they recently worked on. Tracking collection changes would clutter the feed. Limiting to last 10 items keeps dashboard focused.

8. **Plain text editor with basic formatting is sufficient for MVP**
   - Reasoning: Core value is searchability and organization, not rich formatting. Basic formatting (bold, italic, bullets) covers 80% of use cases. Advanced formatting can be added in V2 based on user feedback.

9. **Search result previews show plain text without highlighting**
   - Reasoning: Highlighting matching terms requires additional processing and UI complexity. Plain previews (first 150 characters) provide sufficient context for MVP. Highlighting can be added in V2.

10. **Uniform tag styling is acceptable for MVP**
    - Reasoning: Custom tag colors add visual organization but increase complexity (color picker UI, storage, rendering). Uniform styling keeps MVP focused on core functionality. Custom colors can be added in V2.

### 9.4 Clarification Q&A Summary

**Q:** When a user deletes a collection that contains notes, what should happen to those notes?
**A:** It should hard delete
**Decision:** Collection deletion performs hard delete (permanent removal) of all contained notes. UI shows confirmation warning: "Deleting this collection will permanently delete X notes. This cannot be undone."

**Q:** Can a single note belong to multiple collections simultaneously?
**A:** Yes, single note can exist in multiple collections
**Decision:** Notes have collectionIds array field. UI shows multi-select dropdown for collection assignment. Note appears in all assigned collections. Deleting one collection removes note only if it's the last assigned collection.

**Q:** Should users create custom tags freely or select from predefined set?
**A:** User can define tags but there should be predefined tags as well
**Decision:** System provides predefined tags (decisions, action-items, research, ideas, reference) visible to all users. Users can also create custom tags by typing new names. Tag input shows autocomplete with existing tags (predefined + user's custom tags).

**Q:** When searching with multiple filters, should results match ALL criteria (AND) or ANY criteria (OR)?
**A:** Ask user if he wants OR or AND logic
**Decision:** Search interface includes toggle switch: "Match ALL filters (AND)" vs "Match ANY filter (OR)". User's preference saved in profile. Default is AND logic for precision.

**Q:** Where should pinned notes appear?
**A:** On the top and maybe on the home page
**Decision:** Pinned notes appear: (1) At top of All Notes list with visual indicator (pin icon), (2) In dedicated "Pinned Notes" section on home/dashboard page above recent notes, (3) Sorted by updated date within pinned group.

**Q:** For the Analytics Dashboard's "recent activity" feed, what specific actions should be tracked, and how many recent items should be displayed?
**A:** I don't know
**Decision:** Recent activity tracks note creations and edits only (most valuable for users). Displays last 10 activities with timestamps and note titles. Excludes collection/tag changes to keep feed focused.

**Q:** When displaying search results, should the system highlight the matching search terms within the note previews?
**A:** I don't know
**Decision:** Search results show plain text previews (first 150 characters of note content) without term highlighting. This simplifies MVP implementation while still providing context. Term highlighting can be added in V2.

**Q:** Regarding the "rich text content editor" for notes, do you need support for specific formatting features?
**A:** I don't know
**Decision:** Note editor supports plain text with basic formatting only: bold, italic, bullet points, numbered lists. This covers majority of use cases while keeping MVP focused on core search/organization functionality. Advanced formatting (code blocks, checklists, markdown) deferred to V2.

**Q:** For custom tags users can create, should they be able to assign specific colors to these tags?
**A:** I don't know
**Decision:** All tags (predefined and custom) use uniform styling with default gray color in MVP. This simplifies implementation and keeps focus on core tagging functionality. Custom tag colors can be added in V2 for enhanced visual organization.

---

**PRD Complete - Ready for Development**
