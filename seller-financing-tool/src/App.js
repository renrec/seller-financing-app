import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function calculateIRR(cashflows, guess = 0.1) {
  let x0 = guess;
  for (let i = 0; i < 100; i++) {
    let f = 0;
    let df = 0;
    for (let t = 0; t < cashflows.length; t++) {
      f += cashflows[t] / Math.pow(1 + x0, t);
      df -= t * cashflows[t] / Math.pow(1 + x0, t + 1);
    }
    const x1 = x0 - f / df;
    if (Math.abs(x1 - x0) < 0.00001) return x1;
    x0 = x1;
  }
  return x0;
}

export default function AcquisitionSystem() {
  const [price, setPrice] = useState(300000);
  const [down, setDown] = useState(10);
  const [rate, setRate] = useState(6);
  const [term, setTerm] = useState(30);
  const [balloon, setBalloon] = useState(0);
  const [taxRate, setTaxRate] = useState(20);
  const downAmount = price * (down / 100);
  const loan = price - downAmount;
  const r = rate / 100 / 12;
  const n = term * 12;


  const payment = (loan * r) / (1 - Math.pow(1 + r, -n));

  let balance = loan;
  const schedule = [];
  const cashflows = [downAmount * -1 + price];
  for (let i = 1; i <= n; i++) {
    const interest = balance * r;
    const principal = payment - interest;
    balance -= principal;
    cashflows.push(payment);

    if (balloon > 0 && i === balloon * 12) {
      cashflows[cashflows.length - 1] += balance;
      break;
    }


    if (i % 12 === 0) {
      schedule.push({ year: i / 12, balance: Math.max(balance, 0) });
    }
  }

  const irr = calculateIRR(cashflows) * 12 * 100;

  const totalReceived = cashflows.reduce((a, b) => a + b, 0);
  const taxEstimate = totalReceived * (taxRate / 100);
  const net = totalReceived - taxEstimate;
  const cashSaleNet = price * (1 - taxRate / 100);
  const handlePrint = () => window.print();


  return (
    <div className="p-6 grid gap-6">
      <h1 className="text-3xl font-bold">Full Seller Financing Acquisition System</h1>

      <section className="border rounded-lg p-4 grid gap-4">
        <h2 className="text-xl font-semibold">Deal Inputs</h2>
        <div className="grid grid-cols-2 gap-4">
          <input type="number" value={price} onChange={e=>setPrice(Number(e.target.value))} placeholder="Price" className="border p-2" />
          <input type="number" value={down} onChange={e=>setDown(Number(e.target.value))} placeholder="Down %" className="border p-2" />
          <input type="number" value={rate} onChange={e=>setRate(Number(e.target.value))} placeholder="Rate %" className="border p-2" />
          <input type="number" value={term} onChange={e=>setTerm(Number(e.target.value))} placeholder="Term" className="border p-2" />
          <input type="number" value={balloon} onChange={e=>setBalloon(Number(e.target.value))} placeholder="Balloon (years) optional" className="border p-2" />
          <input type="number" value={taxRate} onChange={e=>setTaxRate(Number(e.target.value))} placeholder="Tax %" className="border p-2" />
        </div>

        <div className="bg-gray-100 p-4">
          <p>Loan: ${loan.toFixed(0)}</p>
          <p>Payment: ${payment.toFixed(0)}</p>
          <p>Total Received: ${totalReceived.toFixed(0)}</p>
          <p><strong>IRR:</strong> {irr.toFixed(2)}%</p>
        </div>
      </section>

      <section className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold">Cash vs Terms</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-red-100 p-4 rounded">
            <h3 className="font-bold">Cash Sale</h3>
            <p>Net: ${cashSaleNet.toFixed(0)}</p>
          </div>
          <div className="bg-green-100 p-4 rounded">
            <h3 className="font-bold">Seller Financing</h3>
            <p>Net After Taxes: ${net.toFixed(0)}</p>
          </div>
        </div>
      </section>

      <section className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold">Paydown Chart</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={schedule}>
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Line dataKey="balance" stroke="#2563eb" />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold">Amortization</h2>
        <div className="max-h-64 overflow-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="border px-2 py-1 text-left">Year</th>
                <th className="border px-2 py-1 text-left">Balance</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((r,i)=> (
                <tr key={i}>
                  <td className="border px-2 py-1">{r.year}</td>
                  <td className="border px-2 py-1">${r.balance.toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handlePrint}>
        Print Full Seller Report
      </button>
    </div>
  );
}