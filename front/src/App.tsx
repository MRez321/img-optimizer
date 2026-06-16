import {useState} from 'react'

// import './App.css'
import DateAndTime from "./components/DateAndTime/DateAndTime";
import ImageOptimizer from './components/ImageOptimizer/ImageOptimizer.tsx';


function App() {
    const [count, setCount] = useState(0)

    return (
        <>
            <ImageOptimizer />



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