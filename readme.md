# Chain DB TS / JS Client (Node)

A TypeScript / JavaScript client for [Chain DB](https://github.com/wpdas/chain-db), a secure database system with built-in history tracking, offering AES-256-GCM encryption, atomic operations with rollback capability, and automatic backups.

## Installation

```bash
npm install chain-db-ts
# or
yarn add chain-db-ts
```

## Usage

### Connecting to Chain DB

```typescript
import { connect } from 'chain-db-ts'

// Connect to Chain DB
// Parameters: server | database | user | password
// If the server parameter is null, "http://localhost:2818" will be used as default
const db = await connect({
  server: 'http://localhost:2818',
  database: 'my-database',
  user: 'root',
  password: '1234',
})
```

### Working with Tables

Define your table structure using TypeScript interfaces:

```typescript
// Define your table structure
interface GreetingTable {
  greeting: string
}

// Define a more complex table
interface UserTable {
  id: number
  name: string
  email: string
  active: boolean
  createdAt: string
}
```

### Getting a Table

```typescript
// Get a table instance
// If the table already exists in the chain, its data will be loaded. (data from the last record stored in the table)
const greetingTable = await db.getTable<GreetingTable>('greeting')

// Access the current document data (the last record stored in the table)
console.log(greetingTable.currentDoc) // e.g., { greeting: 'Hello' }
```

### Modifying and Persisting Data

```typescript
// Modify the current document data
greetingTable.currentDoc.greeting = 'Hello, Chain DB!'

// Persist changes to database (creates a new record with a new doc_id)
const result = await greetingTable.persist()

// The persist method returns the created document with its doc_id
console.log(result.doc_id) // e.g., '550e8400-e29b-41d4-a716-446655440000'

// You can also access the current document's ID directly
const currentDocId = greetingTable.getCurrentDocId()
console.log(currentDocId) // Same as result.doc_id
```

### Updating Item

```typescript
// To update a specific document, first get it by ID
const docId = '550e8400-e29b-41d4-a716-446655440000'
const specificDoc = await greetingTable.getDoc(docId)

// Then update its data
specificDoc.doc.greeting = 'Updated greeting'
await specificDoc.update()
```

### Getting a Specific Document

```typescript
// Get a specific document by its ID (assuming we know a document ID)
// The document ID is generated by ChainDB when data is persisted
const docId = '550e8400-e29b-41d4-a716-446655440000' // Example ID
const specificDoc = await greetingTable.getDoc(docId)

// Access the document data
console.log(specificDoc.doc) // e.g., { greeting: 'Hello from specific doc', doc_id: '550e8400-e29b-41d4-a716-446655440000' }

// The doc_id is also available directly in the document object
console.log(specificDoc.doc.doc_id) // '550e8400-e29b-41d4-a716-446655440000'

// Update the specific document
specificDoc.doc.greeting = 'Updated greeting for specific doc'
await specificDoc.update() // Updates only this specific document

// Refetch the document data if it might have been updated elsewhere
await specificDoc.refetch()
console.log(specificDoc.doc) // Updated data from the database

// Get the table name this document belongs to
const tableName = specificDoc.getTableName() // 'greeting'
```

Note: The `TableDoc` instance returned by `getDoc()` is a simplified version of a table that only allows updating the specific document. It cannot create new records with `persist()` or perform other table operations.

### Getting Table History

```typescript
// Get the last 100 changes to the table
const history = await greetingTable.getHistory(100)
console.log(history)
// Example output:
// [
//   { greeting: 'Hello, Chain DB!' },
//   { greeting: 'Hello' },
//   { greeting: 'Hi there' },
//   ...
// ]
```

### Real-time Events with WebSockets

Chain DB supports real-time updates through WebSockets. You can subscribe to table events to get notified when data changes:

```typescript
import { EventTypes, EventData } from 'chain-db-ts'

// Subscribe to table update events
db.events().subscribe(EventTypes.TABLE_UPDATE, (eventData: EventData) => {
  console.log('Table updated:', eventData.table)
  console.log('New data:', eventData.data)
})

// Subscribe to new data persistence events
db.events().subscribe(EventTypes.TABLE_PERSIST, (eventData: EventData) => {
  console.log('New data added to table:', eventData.table)
  console.log('Data:', eventData.data)
})

// Unsubscribe from an event
const myCallback = (eventData: EventData) => {
  // Handle event
}
db.events().subscribe(EventTypes.TABLE_UPDATE, myCallback)
// Later, when you want to unsubscribe:
db.events().unsubscribe(EventTypes.TABLE_UPDATE, myCallback)

// Close WebSocket connection when done
db.events().closeEvents()
```

The `EventData` object contains:

- `event_type`: The type of event (TableUpdate, TablePersist)
- `database`: The database name
- `table`: The table name
- `data`: The data associated with the event
- `timestamp`: When the event occurred

### Querying Data

#### Basic Queries

```typescript
// Find items with exact matches
const users = await userTable.findWhere(
  { active: true, name: 'John' }, // criteria
  10, // limit (default: 1000)
  true // reverse order (default: true)
)
```

#### Advanced Queries

```typescript
import { Operators } from 'chain-db-ts'

// Find items with advanced criteria
const users = await userTable.findWhereAdvanced(
  [
    {
      field: 'name',
      operator: Operators.CONTAINS,
      value: 'John',
    },
    {
      field: 'age',
      operator: Operators.GREATER_THAN,
      value: 25,
    },
  ],
  10, // limit
  true // reverse order
)
```

Available operators:

- `EQUAL` (==)
- `NOT_EQUAL` (!=)
- `GREATER_THAN` (>)
- `GREATER_THAN_OR_EQUAL` (>=)
- `LESS_THAN` (<)
- `LESS_THAN_OR_EQUAL` (<=)
- `CONTAINS` (for strings and arrays)
- `STARTS_WITH` (for strings)
- `ENDS_WITH` (for strings)

### Other Table Methods

```typescript
// Check if a table is empty
const isEmpty = greetingTable.isEmpty()

// Get the table name
const tableName = greetingTable.getName()

// Refetch the table data from the database
await greetingTable.refetch()
```

## Complete Example

```typescript
import { connect, EventTypes, EventData } from 'chain-db-ts'

// Define table structure
interface GreetingTable {
  greeting: string
}

async function main() {
  // Connect to Chain DB
  const db = await connect({
    server: 'http://localhost:2818',
    database: 'test-db',
    user: 'root',
    password: '1234',
  })

  // Get the "greeting" table
  const greetingTable = await db.getTable<GreetingTable>('greeting')
  console.log(greetingTable.currentDoc) // e.g., { greeting: 'Hi' }

  // Subscribe to table update events
  db.events().subscribe(EventTypes.TABLE_UPDATE, (eventData: EventData) => {
    if (eventData.table === 'greeting') {
      console.log('Greeting table updated:', eventData.data)
    }
  })

  // Modify and persist data
  greetingTable.currentDoc.greeting = 'Hello my dear!'
  const persistResult = await greetingTable.persist() // Data is persisted on database

  // Get the doc_id of the newly created document
  console.log('New document ID:', persistResult.doc_id)

  // You can also get the current document ID directly from the table
  const currentDocId = greetingTable.getCurrentDocId()
  console.log('Current document ID:', currentDocId)

  // See the updated values
  console.log(greetingTable.currentDoc) // { greeting: 'Hello my dear!', doc_id: '...' }

  // Get a specific document by its ID
  // We can use the ID we just got from the persist operation
  const specificDoc = await greetingTable.getDoc(currentDocId)

  // Access the document data and ID
  console.log(specificDoc.doc) // { greeting: 'Hello my dear!', doc_id: '...' }
  console.log(specificDoc.doc.doc_id) // Same as currentDocId

  // Update a specific document
  specificDoc.doc.greeting = 'Updated specific document'
  await specificDoc.update() // Updates only this specific document

  // Refetch the document to get the latest data
  await specificDoc.refetch()
  console.log(specificDoc.doc) // Latest data from the database

  // Get the last 100 changes
  const greetingHistory = await greetingTable.getHistory(100)
  console.log(greetingHistory)
  // [
  //   { greeting: 'Updated specific document' },
  //   { greeting: 'Hello my dear!' },
  //   { greeting: 'Hi' },
  //   ...
  // ]

  // Close WebSocket connection when done
  db.events().closeEvents()
}

main().catch(console.error)
```

## License

MIT
