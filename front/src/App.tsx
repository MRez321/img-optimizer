import {useState} from 'react'

// import './App.css'
import DateAndTime from "./components/DateAndTime/DateAndTime";
import ImageCompressor from './components/ImageCompressor';


function App() {
    const [count, setCount] = useState(0)

    return (
        <>
            <ImageCompressor />



            <button
                type="button"
                className="counter"
                onClick={() => setCount((count) => count + 1)}
            >
                Count is {count}
            </button>
            <div className="ticks"></div>

        </>
    )
}

function Rcomp() {
    return (
        <>
            <h4>From Extra Comp</h4>
            <DateAndTime />
        </>
    )
}

export default App;
export { Rcomp }