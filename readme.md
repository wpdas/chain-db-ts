# Chain DB - TS

ChainDB TS is a library that allows the usage of the ChainDB database in TypeScript and JavaScript projects.

Chain DB is a Story-driven database. This new type of system uses some features used in blockchain technology. Each change generates a transaction that is saved in a block. The network works centrally, so persistent data is not decentralized.

This database has some features by default, such as: create user account, get user account, transfer units and get transfer records as well as the main feature that is tables.

The `unit` property present in each user's account can be anything the project wants, it can be a type of currency, item, resource.

Visit the [Chain DB repository](https://github.com/wpdas/chain-db) to get to know more.

## Install

Install using npm or yarn:

```sh
npm install chain-db-ts

# or

yarn add chain-db-ts
```

## Usage examples

First of all, it's good to know that all requests return a `BasicResponse<D>` object that has the following structure:

**success:** `boolean` (informs if the transaction was successful) <br/>
**error_msg:** `string` (error message) <br/>
**data:** `D` (any expected data type depending on the request) <br/>

Make sure you have the database running on your local machine or use the server link from where the database is running.

### Table

Tables must be simple class with default values, empty or not. This class will be used as a reference to create the table's fields.

When it's time to persist the table's data on the chain, just call the `persit` database function.

```ts
// Greeting Table
class GreetingTable {
  public greeting = 'Hi'
}
```

```ts
import { connect } from 'chain-db-ts'
import { GreetingTable } from './tables'

const main async () {
  // server | db-name | user | password
  // If the `server` parameter is empty(null), then "http://localhost:2818" will be used.
  const db = connect('http://localhost:2818', 'test-db', 'root', '1234')

  // Initialize the "greeting" table using the "GreetingTable"
  // class as a template. If there is already any data saved in
  // the chain, this data will be populated in the table instance.
  const greetingTable = await db.get_table('greeting', new GreetingTable())
  console.log(greetingTable.table) // { greeting: 'Hi' }

  // Mutating data
  greetingTable.table.greeting = "Hello my dear!"
  await greetingTable.persist() // Data is persisted on the blockchain

  // See the most updated values of the table
  console.log(greetingTable.table) // { greeting: 'Hello my dear!' }

  // Get the last 100 changes
  const greetingHistory = greetingTable.getHistory(100);
  console.log(greetingHistory);
  // [
  //   { greeting: 'Hello my dear!' },
  //   { greeting: 'Hi' },
  //   { greeting: 'Ei, sou eu :D' },
  //   { greeting: 'Heyo' },
  //   ...
  // ]
}
main()
```

The next examples will not include the `db` implementation, ` import` lines and the `const main async () {}` block as this is implied.

### Create User Account

This is a default database feature that allows you to create user accounts within the database. As these are hashed accounts, the only data required is: Username and Password. This data is hashed, that is, only the user with the correct data can access the data.

It is not possible to recover an account in which the user has forgotten access data.

```ts
const user_name = 'wenderson.fake'
const user_pass = '1234'

// Check if the given name is already in use
const user_name_taken = await db.check_user_name(user_name)
if (!user_name_taken.success) {
  // user name | password | units (optional) | password hint (optional - may be used in the future versions)
  const user = await db.create_user_account(user_name, user_pass, 2)
  console.log(user.data)
  // {
  //   id: 'b2e4e7c15f733d8c18836ffd22051ed855226d9041fb9452f17f498fc2bcbce3',
  //   user_name: 'wenderson.fake',
  //   units: 2
  // }
}
```

### Get User Account Info

This feature can be used for the "Login/Sign In" action.

```ts
const user_name = 'wenderson.fake'
const user_pass = '1234'
const user = await db.get_user_account(user_name, user_pass)
console.log(user.data)
// {
//   id: 'b2e4e7c15f733d8c18836ffd22051ed855226d9041fb9452f17f498fc2bcbce3',
//   user_name: 'wenderson.fake',
//   units: 2
// }
```

### Get User Account Info By User Id

Just another way to fetch the user info.

```ts
const wenderson_id = 'b2e4e7c15f733d8c18836ffd22051ed855226d9041fb9452f17f498fc2bcbce3'
const user = await db.get_user_account_by_id(wenderson_id)
console.log(user.data)
// {
//   id: 'b2e4e7c15f733d8c18836ffd22051ed855226d9041fb9452f17f498fc2bcbce3',
//   user_name: 'wenderson.fake',
//   units: 2
// }
```

### Transfer Units Between Two Users

As said before, `unit` property present in each user's account can be anything the project wants, it can be a type of currency, item, resource.

Below is an example of user `wenderson` trying to send 2 units to `suly`:

```ts
const wenderson_id = 'b2e4e7c15f733d8c18836ffd22051ed855226d9041fb9452f17f498fc2bcbce3'
const suly_id = '136c406933d98e5c8bb4820f5145869bb5ad40647b768de4e9adb2a52d0dea2f'

const wenderson_data = await db.get_user_account_by_id(wenderson_id)
const units_to_transfer = 2

if (wenderson_data.data!.units >= units_to_transfer) {
  const res = await db.transfer_units(wenderson_id, suly_id, units_to_transfer)
  console.log(res.success)
  // true / false
}
```

### Fetching the Latest Units Transfer Record

Use this feature to get the last unit transfer record involving a user.

```ts
const wenderson_id = 'b2e4e7c15f733d8c18836ffd22051ed855226d9041fb9452f17f498fc2bcbce3'
const last_units_transference_record = await db.get_transfer_by_user_id(wenderson_id)
console.log(last_units_transference_record.data)
// {
//   from: 'b2e4e7c15f733d8c18836ffd22051ed855226d9041fb9452f17f498fc2bcbce3',
//   to: '136c406933d98e5c8bb4820f5145869bb5ad40647b768de4e9adb2a52d0dea2f',
//   units: 2
// }
```

### Fetching All the Transfer of Units Records

Use this feature to get the last unit transfer record involving a user.

```ts
const wenderson_id = 'b2e4e7c15f733d8c18836ffd22051ed855226d9041fb9452f17f498fc2bcbce3'
const all_units_transfers_record = await db.get_all_transfers_by_user_id(wenderson_id)
console.log(all_units_transfers_record.data)
// [
//   {
//     from: 'b2e4e7c15f733d8c18836ffd22051ed855226d9041fb9452f17f498fc2bcbce3',
//     to: '136c406933d98e5c8bb4820f5145869bb5ad40647b768de4e9adb2a52d0dea2f',
//     units: 2
//   },
//   {
//     from: '136c406933d98e5c8bb4820f5145869bb5ad40647b768de4e9adb2a52d0dea2f',
//     to: 'b2e4e7c15f733d8c18836ffd22051ed855226d9041fb9452f17f498fc2bcbce3',
//     units: 6
//   },
//   ...
// ]
```
