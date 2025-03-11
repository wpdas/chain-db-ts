# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0-rc.3] - 2025-03-11

### Changed

- Added support to older version while using the `getCurrentDocId()` method.

## [1.0.0-rc.2] - 2025-03-05

### Added

- New `TableDoc` interface for working with specific documents
- Added `refetch()` method to `TableDoc` to get the latest document data
- Added `getTableName()` method to `TableDoc` to get the table name
- Added `isEmpty()` method to `TableDoc` to check if the document is empty
- Added `DocId<Model>` type that adds a readonly `doc_id` property to models
- Added `getCurrentDocId()` method to `Table` to get the current document ID
- The `persist()` method now returns the created document with its `doc_id`
- Document IDs are now accessible directly via `doc_id` property in both `Table` and `TableDoc` instances

### Changed

- **BREAKING CHANGE**: Renamed `table` property to `currentDoc` in `Table` class for better semantics
- Improved error messages with more details about the operation and error
- Enhanced type safety with the `DocId<Model>` type

### Removed

- **BREAKING CHANGE**: Removed `update()` method from `Table` class
  - To update documents, you must now use `getDoc()` to get a document reference and then call `update()` on that reference
  - This change prevents accidental creation of duplicate records and makes the API more intuitive

### Migration Guide

#### Property Renaming

Before:

```typescript
// Accessing table data
console.log(greetingTable.table)

// Accessing document data from TableDoc
console.log(specificDoc.table)
```

After:

```typescript
// Accessing current document data from Table
console.log(greetingTable.currentDoc)

// Accessing document data from TableDoc
console.log(specificDoc.doc)
```

#### Updating Documents

Before:

```typescript
// Update the last item
greetingTable.table.greeting = 'Updated greeting'
await greetingTable.update()

// Update a specific document by ID
greetingTable.table.greeting = 'Updated specific document'
await greetingTable.update('550e8400-e29b-41d4-a716-446655440000')
```

After:

```typescript
// Get a specific document by ID
const specificDoc = await greetingTable.getDoc('550e8400-e29b-41d4-a716-446655440000')

// Update the document
specificDoc.doc.greeting = 'Updated greeting'
await specificDoc.update()

// Optionally, refetch the document to get the latest data
await specificDoc.refetch()
```

#### Accessing Document IDs

New in this version:

```typescript
// When persisting data, you get the document ID in the result
const result = await greetingTable.persist()
console.log(result.doc_id) // The ID of the newly created document

// You can also get the current document ID directly from the table
const currentDocId = greetingTable.getCurrentDocId()

// When working with a specific document, the ID is available in multiple ways
const specificDoc = await greetingTable.getDoc(docId)
console.log(specificDoc.doc_id) // From the TableDoc instance
console.log(specificDoc.doc.doc_id) // From the document object
```

## [1.0.0-rc.1] - 2025-03-01

Initial release candidate.

### Added

- Type-safe API with TypeScript generics
- Promise-based API with async/await
- WebSocket support for real-time updates
- Advanced query capabilities
- Complete history access
