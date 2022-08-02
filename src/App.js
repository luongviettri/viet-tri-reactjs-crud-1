import Header from './Header';
import SearchItem from './SearchItem';
import AddItem from './AddItem';
import Content from './Content';
import Footer from './Footer';
import { useState, useEffect } from 'react';
import apiRequest from './apiRequest';
function App() {
  // link lấy API ( API này do mình tự tạo ra trong folder data)
  // const API_URL = 'http://localhost:3500/items';
  const API_URL = "https://62db6cb5e56f6d82a77285f3.mockapi.io/items"
  // tạo tin nhắn đang loading
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('')
  const [search, setSearch] = useState('')
  // tạo biến thông báo lỗi khi fetch API, ban đầu đặt lỗi là null
  const [fetchError, setFetchError] = useState(null);

  // giống componentDidMount
  useEffect(() => {

    const fetchItems = async () => {
      try {
        const response = await fetch(API_URL);
        const listItems = await response.json();
        // nếu đường truyền API bị lỗi
        if (!response.ok) {
          throw Error('Không tìm được dữ liệu cần thiết')
        }
        // lấy item từ API set vào mảng items
        setItems(listItems);
        setFetchError(null);
      } catch (error) {
        setFetchError(error.message);
      } finally {
        setIsLoading(false);
      }
    }
    // gọi hàm fetch fetch item
    // bởi vì API thật ko nhanh như rest API cho nên tạo một hàm setTimeOut để giả sử nếu API ko load kịp thì xử lý

    setTimeout(() => {
      (async () => {
        await fetchItems()
      })();
    }, 2000);



  }, [])

  const addItem = async (item) => {
    const id = items.length ? items[items.length - 1].id + 1 : 1;
    const myNewItem = { id, checked: false, item };
    const listItems = [...items, myNewItem];
    setItems(listItems);

    const postOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(myNewItem)
    }
    const result = await apiRequest(API_URL, postOptions);
    if (result) setFetchError(result);
  }

  const handleCheck = async (id) => {
    // tạo listItems: duyệt item, copy lại toàn bộ thuộc tính của item cũ, và nếu item đó có id = id đang dc truyền vào thì set check = !check ( check ban đầu là !check hay false);
    const listItems = items.map((item) => item.id === id ?
      { ...item, checked: !item.checked }
      :
      item
    );
    setItems(listItems);

    // update lại item dc checked trong file json ( API)
    const myItem = listItems.filter((item) => {
      return item.id === id;
    })
    const updateOptions = {
      // method path dùng để update lên API
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ checked: myItem[0].checked })
    }
    // url của item cần update phải cụ thể theo ID chứ ko giống với url khi add item hoặc read item
    const reqUrl = `${API_URL}/${id}`;
    const result = await apiRequest(reqUrl, updateOptions);
    if (result) {
      setFetchError(result);
    }

  }

  const handleDelete = async (id) => {
    const listItems = items.filter((item) => item.id !== id);
    setItems(listItems);

    const deleteOptions = {
      // method path dùng để update lên API
      method: 'DELETE',

    }
    // method delete là đơn giản nhất
    const reqUrl = `${API_URL}/${id}`;
    const result = await apiRequest(reqUrl, deleteOptions);
    if (result) {
      setFetchError(result);
    }

  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newItem) return;
    addItem(newItem);
    setNewItem('');
  }

  return (
    <div className="App">
      <Header title="Todo App" />
      <AddItem
        // xem newItem
        newItem={newItem}
        setNewItem={setNewItem}
        handleSubmit={handleSubmit}
      />
      <SearchItem
        search={search}
        setSearch={setSearch}
      />
      <main>
        {/* xu ly loading */}
        {isLoading && <p>Loading Items...</p>}
        {/* nếu fetch API bị lỗi thì dùng ở đây */}
        {fetchError && <p style={{ color: 'red' }} > {`Error: ${fetchError}`} </p>}

        {!fetchError && !isLoading && <Content
          items={items.filter(item => ((item.item).toLowerCase()).includes(search.toLowerCase()))}
          handleCheck={handleCheck}
          handleDelete={handleDelete}
        />
        }

      </main>

      <Footer length={items.length} />
    </div>
  );
}

export default App;
