export default function Layout({
    children,
  }: Readonly<{ children: React.ReactNode }>): JSX.Element {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="fixed z-50 top-0 left-0 w-full p-4 bg-black bg-opacity-80">
          HEADER
        </div>
        <div className="flex-grow flex items-center justify-center">
          <div className="my-24 w-2/3 sm:w-1/2 text-justify">
            {children}
          </div>
        </div>
        <div className="fixed z-50 bottom-0 left-0 w-full p-4 bg-black bg-opacity-80">
          FOOTER
        </div>
      </div>
    );
  }
  