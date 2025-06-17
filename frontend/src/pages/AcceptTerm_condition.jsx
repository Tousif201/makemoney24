import { motion } from "framer-motion";

export default function AcceptTermsAndConditionsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-6 py-10 bg-white shadow-xl rounded-xl mt-10 mb-10 text-gray-800 animate-fadeIn"
    >
      <h1 className="text-3xl md:text-4xl font-bold text-center text-purple-700 mb-6">
        Terms & Conditions / Non-Disclosure Agreement (NDA)
      </h1>

      <div className="space-y-6 text-justify">
        <p>
          <strong>Disclosing Party (Firm):</strong><br />
          Name: <span className="text-black">Make Money 24</span><br />
          Address: <span className="italic">[Insert Firm Address]</span><br />
          (Hereinafter referred to as the "Disclosing Party")
        </p>

        <p>
          <strong>Receiving Party:</strong><br />
          Name: <span className="italic">[Insert Name or Business Name]</span><br />
          Address: <span className="italic">[Insert Address]</span><br />
          (Hereinafter referred to as the "Receiving Party")
        </p>

        <section>
          <h2 className="text-xl font-semibold text-purple-600">1. Purpose</h2>
          <p>
            The Disclosing Party intends to share certain confidential and proprietary
            information with the Receiving Party for the purpose of
            <span className="italic"> [insert purpose, e.g., exploring a potential business partnership, affiliate collaboration, investment discussion, etc.]</span>. This agreement sets forth the terms under which such information shall be protected.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-purple-600">2. Definition of Confidential Information</h2>
          <p>
            For the purpose of this Agreement, "Confidential Information" shall include all
            written, oral, or electronic data, documents, strategies, business models,
            software, technical information, customer lists, financial data, and any other
            non-public information disclosed by the Disclosing Party to the Receiving Party.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-purple-600">3. Obligations of the Receiving Party</h2>
          <ul className="list-disc list-inside ml-4">
            <li>Keep all Confidential Information strictly confidential;</li>
            <li>Not disclose any Confidential Information to any third party without prior written consent;</li>
            <li>Not use the Confidential Information for any purpose other than the agreed business relationship;</li>
            <li>Take all reasonable measures to protect the secrecy of and avoid disclosure or use of Confidential Information.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-purple-600">4. Exclusions from Confidential Information</h2>
          <ul className="list-disc list-inside ml-4">
            <li>Is or becomes publicly known through no breach of this Agreement by the Receiving Party;</li>
            <li>Is received lawfully from a third party without breach of any obligation;</li>
            <li>Is independently developed without the use of or reference to Confidential Information.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-purple-600">5. Term</h2>
          <p>
            This Agreement shall be effective from the date above and shall remain in force for a period of five (5) years from the date of disclosure of Confidential Information, or until terminated in writing by either party with prior notice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-purple-600">6. Return of Information</h2>
          <p>
            Upon request or upon termination of this Agreement, the Receiving Party shall return or destroy all Confidential Information and certify such destruction in writing if required.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-purple-600">7. No License</h2>
          <p>
            Nothing in this Agreement grants the Receiving Party any rights in or to the Confidential Information except as expressly set forth herein.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-purple-600">8. Legal Jurisdiction</h2>
          <p>
            This Agreement shall be governed by and construed in accordance with the laws of
            <span className="italic"> [Insert Jurisdiction, e.g., India]</span>, and any disputes shall be subject to the exclusive jurisdiction of the courts of <span className="italic">[Insert City]</span>.
          </p>
        </section>

        <p className="mt-8">
          IN WITNESS WHEREOF, the parties have executed this Non-Disclosure Agreement as of the date first written above.
        </p>
      </div>
    </motion.div>
  );
}
