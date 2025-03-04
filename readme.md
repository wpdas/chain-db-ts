# Chain DB TypeScript Client

A TypeScript client for [Chain DB](https://github.com/wpdas/chain-db), a simple database that maintains a history of changes, allowing you to track how your data evolves over time.

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
const db = connect({
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
// If the table already exists in the chain, its data will be loaded
const greetingTable = await db.get_table<GreetingTable>('greeting')

// Access the table data
console.log(greetingTable.table) // e.g., { greeting: 'Hello' }
```

### Modifying and Persisting Data

```typescript
// Modify the table data
greetingTable.table.greeting = 'Hello, Chain DB!'

// Persist changes to database
await greetingTable.persist()
```

### Updating the Last Item

```typescript
// Update the last item without creating a new one
greetingTable.table.greeting = 'Updated greeting'
await greetingTable.update()
```

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
import { connect } from 'chain-db-ts'

// Define table structure
interface GreetingTable {
  greeting: string
}

async function main() {
  // Connect to Chain DB
  const db = connect({
    server: 'http://localhost:2818',
    database: 'test-db',
    user: 'root',
    password: '1234',
  })

  // Get the "greeting" table
  const greetingTable = await db.get_table<GreetingTable>('greeting')
  console.log(greetingTable.table) // e.g., { greeting: 'Hi' }

  // Modify and persist data
  greetingTable.table.greeting = 'Hello my dear!'
  await greetingTable.persist() // Data is persisted on database

  // See the updated values
  console.log(greetingTable.table) // { greeting: 'Hello my dear!' }

  // Get the last 100 changes
  const greetingHistory = await greetingTable.getHistory(100)
  console.log(greetingHistory)
  // [
  //   { greeting: 'Hello my dear!' },
  //   { greeting: 'Hi' },
  //   { greeting: 'Ei, sou eu :D' },
  //   { greeting: 'Heyo' },
  //   ...
  // ]
}

main().catch(console.error)
```

## License

MIT
