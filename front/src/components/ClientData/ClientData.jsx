import './ClientData.css';
import ClientIP from './ClientIP.jsx';
import ClientBrowser from './ClientBrowser.jsx';
import ClientScreenResolution from './ClientScreenResolution.jsx';
import ClientGeoLocation from './ClientGeoLocation.jsx';
import ClientOperatingSystem from './ClientOperatingSystem.jsx';
import ClientLanguage from './ClientLanguage.jsx';
import ClientScreenColorDepth from './ClientScreenColorDepth.jsx';
import ClientCookies from './ClientCookies.jsx';
import ClientEncoding from './ClientEncoding.jsx';
import ClientLocation from './ClientLocation.jsx';
import LastVisitTime from './LastVisitTime.jsx';
import TimeSpentOnWebsite from './TimeSpentOnWebsite.jsx';
import ReferringInfo from './ReferringInfo.jsx';
import ConnectionInfo from './ConnectionInfo.jsx';
import PingTest from './PingTest.jsx';

function ClientData() {
    return (
        <div className='ClientData'>
            <ClientIP />
            <ClientBrowser />
            <ClientScreenResolution />
            <ClientScreenColorDepth />
            <ClientOperatingSystem />
            <ConnectionInfo />
            <ReferringInfo />
            <ClientLanguage />
            <ClientEncoding />
            <LastVisitTime />
            <TimeSpentOnWebsite />
            {/* <ClientGeoLocation /> */}
            {/* <ClientLocation /> */}
            <ClientCookies />
            <PingTest />
        </div>
    );
}

export default ClientData;
