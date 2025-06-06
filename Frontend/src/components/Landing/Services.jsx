import { FaTabletAlt, FaUtensils, FaConciergeBell, FaMoneyCheckAlt, FaChartBar, FaBell, FaCogs, FaMobileAlt } from 'react-icons/fa';
import { MdDashboardCustomize } from 'react-icons/md';

const services = [
  {
    icon: <FaTabletAlt className="text-3xl" />,
    title: 'Digital Menu & Table Ordering',
    description:
      'Interactive digital menus with QR code/tablet ordering. Let guests customize and place orders with ease.',
  },
  {
    icon: <FaUtensils className="text-3xl" />,
    title: 'Real-Time Order Management',
    description:
      'Track orders instantly from table to kitchen. Update order statuses in real-time for seamless flow.',
  },
  {
    icon: <FaConciergeBell className="text-3xl" />,
    title: 'Kitchen Display System (KDS)',
    description:
      'Streamline kitchen operations with digital displays. Prioritize, organize, and manage prep time efficiently.',
  },
  {
    icon: <MdDashboardCustomize className="text-3xl" />,
    title: 'Waitstaff Dashboard',
    description:
      'Give servers the tools they need to manage tables, orders, split bills, and more—right from their device.',
  },
  {
    icon: <FaMoneyCheckAlt className="text-3xl" />,
    title: 'Integrated Billing & Payments',
    description:
      'Fast, accurate billing with split payments, tax handling, and support for multiple payment methods.',
  },
  {
    icon: <FaChartBar className="text-3xl" />,
    title: 'Analytics & Reports',
    description:
      'Make data-driven decisions with detailed reports on orders, sales, peak hours, and top-performing items.',
  },
  {
    icon: <FaBell className="text-3xl" />,
    title: 'Table Notification System',
    description:
      'Notify guests when their orders are ready or when service is needed—no interruptions, just smooth service.',
  },
  {
    icon: <FaCogs className="text-3xl" />,
    title: 'Customization & Integration',
    description:
      'Integrate with your POS, CRM, or loyalty apps. Highly customizable to fit your restaurant’s unique needs.',
  },
  {
    icon: <FaMobileAlt className="text-3xl" />,
    title: 'Multi-Device Support',
    description:
      'Access and control the system from tablets, desktops, or mobile devices. Stay connected anytime, anywhere.',
  },
];

export default function ServicesSection() {
  return (
    <section className='py-12'>
      <div >
        <h2 className="text-4xl font-bold text-center mb-12">🍽️ Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-gray-900 rounded-2xl p-6 shadow-md hover:shadow-lg transition duration-300"
            >
              <div className="mb-4">{service.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-gray-500">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
