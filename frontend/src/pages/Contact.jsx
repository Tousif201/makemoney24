export default function Contact() {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
        <form className="space-y-4">
          <input type="text" placeholder="Name" className="w-full border p-2 rounded"/>
          <input type="email" placeholder="Email" className="w-full border p-2 rounded"/>
          <textarea placeholder="Message" className="w-full border p-2 rounded h-32"></textarea>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Send</button>
        </form>
      </div>
    );
  }
  