// this script tag will get added to the index html

// ***** IMPORTANT NOTE ****//
//IndexedDB can feel a little clumsy at times. If the database isn't doing what you intend it to do, simply delete the database using the DevTools application tab and refresh the page so that it re-creates itself. It's a lot easier than messing with the versioning features


//Here, we create a variable db that will store the connected database object when the connection is complete. After that, we create the request variable to act as an event listener for the database. That event listener is created when we open the connection to the database using the indexedDB.open() method
// create variable to hold db connection
let db;
// establish a connection to IndexedDB database called 'budget_tracker' and set it to version 1
//The .open() method we use here takes the following two parameters:
//The name of the IndexedDB database you'd like to create (if it doesn't exist) or connect to (if it does exist)
//The version of the database. By default, we start it at 1. This parameter is used to determine whether the database's structure has changed between connections. Think of it as if you were changing the columns of a SQL database
const request = indexedDB.open('budget_tracker', 1);


//Like other database systems, the IndexedDB database itself doesn't hold the data. In SQL, tables hold the data; likewise, in MongoDB, collections hold the data. In IndexedDB, the container that stores the data is called an object store. We can't create an object store until the connection to the database is open, emitting an event that the request variable will be able to capture. Let's add that now.

// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
request.onupgradeneeded = function(event) {
    // save a reference to the database 
    const db = event.target.result;
    // create an object store (table) called `budget_tracker`, set it to have an auto incrementing primary key of sorts 
    // the objectstore will hold the budget data
    //we also instruct that store to have an auto incrementing index for each new set of data we insert. Otherwise we'd have a hard time retrieving data.
    db.createObjectStore('new_budget', { autoIncrement: true });
  };

  //Before we move on to actually saving data, let's add a few more event listeners to the request object. Add the following code below the rest of the code in idb.js:

  // upon a successful 
request.onsuccess = function(event) {
    // when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
    db = event.target.result;
  
    // check if app is online, if yes run uploadTransaction() function to send all local db data to api
    if (navigator.onLine) {
      // function created below
       uploadTransaction();
    }
  };
  
  request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
  };

// This function will be executed if we attempt to submit new budget info and there's no internet connection
//With IndexedDB, we don't always have that direct connection like we do with SQL and MongoDB databases, so methods for performing CRUD operations with IndexedDB aren't available at all times. Instead, we have to explicitly open a transaction, or a temporary connection to the database. This will help the IndexedDB database maintain an accurate reading of the data it stores so that data isn't in flux all the time
//Once we open that transaction, we directly access the new_budget object store, because this is where we'll be adding data. Finally, we use the object store's .add() method to insert data into the new_budget object store
function saveRecord(record) {
    // open a new transaction with the database with read and write permissions 
    const transaction = db.transaction(['new_budget'], 'readwrite');
  
    // access the object store for `new_budget`
    const budgetObjectStore = transaction.objectStore('new_budget');
  
    // add record to your store with add method
    budgetObjectStore.add(record);
}


//We need to create a function that will handle collecting all of the data from the new_budget object store in IndexedDB and POST it to the server,
//With this uploadTransaction() function, we open a new transaction to the database to read the data. Then we access the object store for new_budget and execute the .getAll() method to it.
function uploadTransaction() {
    // open a transaction on your db to read the data
    const transaction = db.transaction(['new_budget'], 'readwrite');
  
    // access your object store
    const budgetObjectStore = transaction.objectStore('new_budget');
  
    // get all records from store and set to a variable
    const getAll = budgetObjectStore.getAll();
    //// the .getAll() method is an asynchronous function that we have to attach an event handler to in order to retrieve the data. Let's add that next
    //.onsuccess is the event handler
    // upon a successful .getAll() execution, run this function
    getAll.onsuccess = function() {
    // if there was data in indexedDb's store, let's send it to the api server
    if (getAll.result.length > 0) {
      fetch('/api/transaction', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          // open one more transaction
          const transaction = db.transaction(['new_budget'], 'readwrite');
          // access the new_pizza object store
          const budgetObjectStore = transaction.objectStore('new_budget');
          // clear all items in your store
          budgetObjectStore.clear();

          alert('All saved transactions have been submitted!');
        })
        .catch(err => {
          console.log(err);
        });
    }
  };
  
    
}

//Now let's test this out. First, navigate up to the request.onsuccess event handler we created earlier and uncomment the call to uploadTransaction(). With this uncommented, we'll check to see if we're online every time this app opens and upload any remnant pizza data, just in case we left the app with items still in the local IndexedDB database. That way, users won't have to worry about staying in the app to ensure the data is eventually uploaded—it'll do that for them next time they return!

//But what happens if the internet outage is temporary and it comes back one minute after it saves to IndexedDB? What can the user do to trigger this uploadTransaction() function?

//Well, they won't have to do anything—instead, we'll add a browser event listener to check for a network status change!

//Here, we instruct the app to listen for the browser regaining internet connection using the online event. If the browser comes back online, we execute the uploadTransaction() function automatically.

// listen for app coming back online
window.addEventListener('online', uploadTransaction);