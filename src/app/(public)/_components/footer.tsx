export function Footer() {
  return (
    <footer className="py-8 bg-white border-t border-gray-100 text-center text-sm text-gray-500">
      <div className="container mx-auto px-4">
        <p>
          Todos os direitos reservados © {new Date().getFullYear()} —{" "}
          <span className="font-medium text-gray-700">OdontoPRO</span>
        </p>
      </div>
    </footer>
  );
}