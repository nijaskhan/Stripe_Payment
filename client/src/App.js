import { useState } from 'react';
import './App.css';
import StripeContainer from './components/StripeContainer';

function App() {
  const [showProduct, setShowProduct] = useState(false);
  return (
    <>
      <h1>The Tech Store</h1>
      <div className='App'>
        {showProduct ? (
          <StripeContainer />
        ) : (
          <>
            <div>
            <img src={'https://rukminim2.flixcart.com/image/416/416/kj7gwi80/gamingconsole/n/3/c/cfi-1008b01r-825-sony-no-original-imafytxenahqnnpu.jpeg?q=70'} alt='playStation' />
            <h3 style={{color: 'blue'}}>$10.00</h3>
            <button onClick={() => setShowProduct(true)}>Purchase Spatula</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default App;