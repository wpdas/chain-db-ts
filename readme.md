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

#### Asynchronously

```typescript
import { connect } from 'chain-db-ts'

// Connect to Chain DB async
// Parameters: server | database | user | password
// If the server parameter is null, "http://localhost:2818" will be used as default
const db = await connect({
  server: 'http://localhost:2818',
  database: 'my-database',
  user: 'root',
  password: '1234',
})
```

#### Synchronously

This is better if you don't want to configure a connection using Promise, which can block the initialization of the application.

```typescript
import { connectWithToken } from 'chain-db-ts'

// Connect to Chain DB sync
// Parameters: server | database | token
// If the server parameter is null, "http://localhost:2818" will be used as default
const db = connectWithToken({
  server: 'http://localhost:2818',
  database: 'my-database',
  // Go to https://github.com/wpdas/chain-db?tab=readme-ov-file#authentication to understand how to get this token
  token: 'dGVzdF9kYjpyb290OjEyMzQ=',
})
```

### Working with Tables

Define your table structure using TypeScript interfaces or types:

```typescript
// Define your table schema
interface GreetingTable {
  greeting: string
}

// Define a more complex table schema
interface UserTable {
  id: number
  name: string
  email: string
  active: boolean
  createdAt: string
  address: {...}
}
```

### Create

```typescript
// Table Instances
const Greeting = db.getTable<GreetingTable>('greetings') // where "greetings" is the table name
const User = db.getTable<UserTable>('users') // where "users" is the table name

// Creates and stores new data into greetings table and returns its content
const newGreeting = await Greeting.new({ greeting: "Hello" })
// newGreeting.doc => { doc_id: "xyz123", greeting: "Hello" }
// newGreeting.getTableName() => "greetings"
// newGreeting.isEmpty() => true / false
// await newGreeting.refetch() => Fetch updated content. This is useful when the data has been changed elsewhere.
// await newGreeting.update() => Should be called when you change the newGreeting.doc body
```

### Get

```typescript
// Get the last register
const greeting = await Greeting.last();
console.log(greeting.doc) // e.g., { doc_id: "550e8400-e29b-41d4-a716-446655440000", greeting: "Hello" }

// OR

// Get by doc id
const docId = '550e8400-e29b-41d4-a716-446655440000'
const specificGreeting = await Greeting.getByDocId(docId)
console.log(specificGreeting.doc) // e.g., { doc_id: "550e8400-e29b-41d4-a716-446655440000", greeting: "Hello" }
```

### Updating Item

```typescript
greeting.doc = { greeting: "Olá Mundo!" }; // OR greeting.doc.greeting = "Olá Mundo!"
await greeting.update()
```

<!-- Note: The `TableDoc` instance returned by `getByDocId()` is a simplified version of a table that only allows updating the specific document. -->

### Getting Table History

```typescript
// Get the last 100 changes to the table
const history = await Greeting.getHistory(100)
history.forEach(item => {
  // Table data instance
  console.log(item.doc);
});
// Example output:
// { greeting: 'Hello, Chain DB!' },
// { greeting: 'Hello' },
// { greeting: 'Hi there' },
//  ...
```

### Real-time Events with WebSockets

Chain DB supports real-time updates through WebSockets. You can subscribe to table events to get notified when data changes:

```typescript
import { EventTypes, EventData } from 'chain-db-ts'

// Subscribe to table update events
db.events().subscribe(EventTypes.TABLE_UPDATE, (eventData: EventData) => {
  console.log('Table updated:', eventData.table) // e.g. greetings
  console.log('New data:', eventData.data) // e.g. { greeting: "Hello World!" }
})

// Subscribe to new data persistence events
db.events().subscribe(EventTypes.TABLE_PERSIST, (eventData: EventData) => {
  console.log('New data added to table:', eventData.table) // e.g. greetings
  console.log('Data:', eventData.data) // e.g. { greeting: "Hello World!" }
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
const users = await User.findWhere(
  { active: true, name: 'John' }, // criteria
  10, // limit (default: 1000)
  true // reverse order (default: true)
)
```

#### Advanced Queries

```typescript
import { Operators } from 'chain-db-ts'

// Find items with advanced criteria
const users = await User.findWhereAdvanced(
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

## License

MIT
