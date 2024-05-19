import logo from './comp-logo.png'
import SalesChart from './SalesChart';

function Home() {
  return (
    <div>
      <nav>
        <img src={logo} alt="logo" />
        <div className="burger">
            <div className="line"></div>
            <div className="line"></div>
            <div className="line"></div>
        </div>
      </nav>
      <div className="container">
        <div className="sales">
            <h1>SALES</h1>
            <SalesChart />
        </div>
      </div>
    </div>
  );
}

export default Home;