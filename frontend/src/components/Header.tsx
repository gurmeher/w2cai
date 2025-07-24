export default function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav aria-label="Global" className="flex items-center justify-between p-6 lg:px-8">
        <div className="flex lg:flex-1">
          <a href="#" className="-m-1.5 p-1.5">
            <span className="sr-only">x</span>
            <img
              alt=""
              src="../w2cai_logo.svg"
              className=" py-2 h-auto w-18"
            />
          </a>
        </div>
      </nav>
    </header>
  );
}
// original src for img was https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600