export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white p-4 mt-10">
      <div className="text-center">&copy; {new Date().getFullYear()} MySite. All rights reserved.</div>
    </footer>
  );
}
