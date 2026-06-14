import ClientBrowser from './ClientBrowser.jsx';
import ClientIP from './ClientIP.jsx';

import './ClientData.css';
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

            <ClientGeoLocation />

            <ClientLocation />

            <ClientOperatingSystem />

            <ClientLanguage />

            <ClientEncoding />

            <ClientCookies />

            <LastVisitTime />

            <TimeSpentOnWebsite />

            <ReferringInfo />

            <ConnectionInfo />

            <PingTest />
        </div>
    );
}

export default ClientData;
