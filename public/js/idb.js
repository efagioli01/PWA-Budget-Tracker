

const indexedDB =
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB ||
    window.shimIndexedDB;

let db;
const request = indexedDB.open('budget', 1)

request.onupgradeneeded = ({ target }) => {
    let db = target.result
    db.createObjectStore('pending', { autoIncrement: true })
}

request.onsuccess = ({ target }) => {
    let db = target.result
    if (navigator.onLine) {
        checkDataBase()
    }
}

request.onerror = event => console.log(event.target.errorCode)

function checkDataBase() {
    const transaction = db.transaction(['pending'], 'readwrite')
    const store = transaction.objectStore('pending')
    const getAll = store.getAll()

    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(res => res.json())
                .then(() => {
                    const transaction = db.transaction(['pending'], 'readwrite')
                    const store = transaction.objectStore('pending') 
                    store.clear()
                })
        }
    }
}

function saveRecord(record) {
    const transaction = db.transaction(['pending'], 'readwrite')
    const store = transaction.objectStore('pending') 
    store.add(record)
}

window.addEventListener('online', checkDataBase)