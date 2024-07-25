import './Navbar.scss';
import nexLogo from '../../assets/logo.webp';

function Navbar() {
    return (
        <div className='navbar'>
            <a href="https://www.nexlabs.io/">
                <img alt="nex logo" src={nexLogo}/>
            </a>
            <p>dNFTs | Nex Labs</p>
        </div>
    )
}

export default Navbar;