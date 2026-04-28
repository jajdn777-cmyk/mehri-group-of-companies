'use client';
import {
  memo,
  ReactNode,
  useState,
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  forwardRef,
} from 'react';
import {
  motion,
  useAnimation,
  useInView,
  useMotionTemplate,
  useMotionValue,
} from 'framer-motion';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

// ==================== Input Component ====================

const Input = memo(
  forwardRef(function Input(
    { className, type, ...props }: React.InputHTMLAttributes<HTMLInputElement>,
    ref: React.ForwardedRef<HTMLInputElement>
  ) {
    const radius = 100;
    const [visible, setVisible] = useState(false);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({
      currentTarget,
      clientX,
      clientY,
    }: React.MouseEvent<HTMLDivElement>) {
      const { left, top } = currentTarget.getBoundingClientRect();

      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
    }

    return (
      <motion.div
        style={{
          background: useMotionTemplate`
        radial-gradient(
          ${visible ? radius + 'px' : '0px'} circle at ${mouseX}px ${mouseY}px,
          #A7F3D0,
          transparent 80%
        )
      `,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className='group/input rounded-xl p-[2px] transition duration-300'
      >
        <input
          type={type}
          className={cn(
            `shadow-input flex h-12 w-full rounded-xl border-none bg-slate-50 px-4 py-2 text-sm text-slate-900 transition duration-400 group-hover/input:shadow-none placeholder:text-slate-400 focus-visible:ring-[2px] focus-visible:ring-[#A7F3D0] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-white dark:focus-visible:ring-zinc-700`,
            className
          )}
          ref={ref}
          {...props}
        />
      </motion.div>
    );
  })
);

Input.displayName = 'Input';

// ==================== BoxReveal Component ====================

type BoxRevealProps = {
  children: ReactNode;
  width?: string;
  boxColor?: string;
  duration?: number;
  overflow?: string;
  position?: string;
  className?: string;
};

const BoxReveal = memo(function BoxReveal({
  children,
  width = 'fit-content',
  boxColor,
  duration,
  overflow = 'hidden',
  position = 'relative',
  className,
}: BoxRevealProps) {
  const mainControls = useAnimation();
  const slideControls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      slideControls.start('visible');
      mainControls.start('visible');
    }
  }, [isInView, mainControls, slideControls]);

  return (
    <section
      ref={ref}
      style={{
        position: position as any,
        width,
        overflow,
      }}
      className={className}
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 75 },
          visible: { opacity: 1, y: 0 },
        }}
        initial='hidden'
        animate={mainControls}
        transition={{ duration: duration ?? 0.5, delay: 0.25 }}
      >
        {children}
      </motion.div>
      <motion.div
        variants={{ hidden: { left: 0 }, visible: { left: '100%' } }}
        initial='hidden'
        animate={slideControls}
        transition={{ duration: duration ?? 0.5, ease: 'easeIn' }}
        style={{
          position: 'absolute',
          top: 4,
          bottom: 4,
          left: 0,
          right: 0,
          zIndex: 20,
          background: boxColor ?? '#A7F3D0',
          borderRadius: 4,
        }}
      />
    </section>
  );
});

// ==================== Ripple Component ====================

type RippleProps = {
  mainCircleSize?: number;
  mainCircleOpacity?: number;
  numCircles?: number;
  className?: string;
};

const Ripple = memo(function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 11,
  className = '',
}: RippleProps) {
  return (
    <section
      className={`max-w-[50%] absolute inset-0 flex items-center justify-center
        [mask-image:linear-gradient(to_bottom,black,transparent)] ${className}`}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 70;
        const opacity = mainCircleOpacity - i * 0.03;
        const animationDelay = `${i * 0.06}s`;
        const borderStyle = i === numCircles - 1 ? 'dashed' : 'solid';
        const borderOpacity = 5 + i * 5;

        return (
          <span
            key={i}
            className='absolute animate-ripple rounded-full bg-slate-200 border'
            style={{
              width: `${size}px`,
              height: `${size}px`,
              opacity: opacity,
              animationDelay: animationDelay,
              borderStyle: borderStyle,
              borderWidth: '1px',
              borderColor: `rgba(30, 41, 59, ${borderOpacity / 100})`,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            } as any}
          />
        );
      })}
    </section>
  );
});

// ==================== OrbitingCircles Component ====================

type OrbitingCirclesProps = {
  className?: string;
  children: ReactNode;
  reverse?: boolean;
  duration?: number;
  delay?: number;
  radius?: number;
  path?: boolean;
};

const OrbitingCircles = memo(function OrbitingCircles({
  className,
  children,
  reverse = false,
  duration = 20,
  delay = 10,
  radius = 50,
  path = true,
}: OrbitingCirclesProps) {
  return (
    <>
      {path && (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          version='1.1'
          className='pointer-events-none absolute inset-0 size-full'
        >
          <circle
            className='stroke-slate-200 stroke-1'
            cx='50%'
            cy='50%'
            r={radius}
            fill='none'
          />
        </svg>
      )}
      <section
        style={
          {
            '--duration': duration,
            '--radius': radius,
            '--delay': -delay,
          } as React.CSSProperties
        }
        className={cn(
          'absolute flex size-full transform-gpu animate-orbit items-center justify-center rounded-full border bg-slate-50 [animation-delay:calc(var(--delay)*1000ms)] dark:bg-white/10',
          { '[animation-direction:reverse]': reverse },
          className
        )}
      >
        {children}
      </section>
    </>
  );
});

// ==================== TechOrbitDisplay Component ====================

type IconConfig = {
  className?: string;
  duration?: number;
  delay?: number;
  radius?: number;
  path?: boolean;
  reverse?: boolean;
  component: () => React.ReactNode;
};

type TechnologyOrbitDisplayProps = {
  iconsArray: IconConfig[];
  text?: string;
};

const TechOrbitDisplay = memo(function TechOrbitDisplay({
  iconsArray,
  text = 'MEHRI GROUP',
}: TechnologyOrbitDisplayProps) {
  return (
    <section className='relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg'>
      <span className='pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-slate-900 to-slate-400 bg-clip-text text-center text-7xl font-black leading-none text-transparent uppercase tracking-tighter font-serif'>
        {text}
      </span>

      {iconsArray.map((icon, index) => (
        <OrbitingCircles
          key={index}
          className={icon.className}
          duration={icon.duration}
          delay={icon.delay}
          radius={icon.radius}
          path={icon.path}
          reverse={icon.reverse}
        >
          {icon.component()}
        </OrbitingCircles>
      ))}
    </section>
  );
});

// ==================== AnimatedForm Component ====================

type FieldType = 'text' | 'email' | 'password';

type Field = {
  label: string;
  name: string;
  required?: boolean;
  type: FieldType;
  placeholder?: string;
  value?: string;
  error?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

type AnimatedFormProps = {
  header: string;
  subHeader?: string;
  fields: Field[];
  submitButton: string;
  isLogin: boolean;
  onToggleMode: () => void;
  isLoading?: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onGoogleLogin: () => void;
  footer?: ReactNode;
};

const AnimatedForm = memo(function AnimatedForm({
  header,
  subHeader,
  fields,
  submitButton,
  isLogin,
  onToggleMode,
  isLoading,
  onSubmit,
  onGoogleLogin,
  footer
}: AnimatedFormProps) {
  const [visible, setVisible] = useState<boolean>(false);
  const toggleVisibility = () => setVisible(!visible);

  return (
    <section className='max-md:w-full flex flex-col gap-6 w-96 mx-auto'>
      <BoxReveal boxColor='#A7F3D0' duration={0.3}>
        <h2 className='font-black text-4xl text-slate-900 uppercase tracking-tighter font-serif'>
          {header}
        </h2>
      </BoxReveal>

      {subHeader && (
        <BoxReveal boxColor='#A7F3D0' duration={0.3} className='-mt-2'>
          <p className='text-slate-500 text-sm font-medium'>
            {subHeader}
          </p>
        </BoxReveal>
      )}

      <BoxReveal
        boxColor='#A7F3D0'
        duration={0.3}
        overflow='visible'
        width='100%'
      >
        <button
          className='w-full py-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center gap-3 hover:bg-slate-50 transition-all hover:border-slate-300 shadow-sm'
          type='button'
          onClick={onGoogleLogin}
        >
          <img
            src='https://www.svgrepo.com/show/475656/google-color.svg'
            className="w-5 h-5"
            alt='Google'
          />
          Continue with Google
        </button>
      </BoxReveal>

      <BoxReveal boxColor='#A7F3D0' duration={0.3} width='100%'>
        <section className='flex items-center gap-4'>
          <hr className='flex-1 border-slate-100' />
          <p className='text-slate-300 text-[10px] font-black uppercase tracking-widest'>
            OR
          </p>
          <hr className='flex-1 border-slate-100' />
        </section>
      </BoxReveal>

      <form onSubmit={onSubmit} className="space-y-4">
        {fields.map((field) => (
          <section key={field.name} className='flex flex-col gap-1.5'>
            <BoxReveal boxColor='#A7F3D0' duration={0.3}>
              <Label htmlFor={field.name}>
                {field.label} {field.required && <span className='text-red-400'>*</span>}
              </Label>
            </BoxReveal>

            <BoxReveal
              width='100%'
              boxColor='#A7F3D0'
              duration={0.3}
              className='w-full'
            >
              <section className='relative'>
                <Input
                  type={
                    field.type === 'password'
                      ? visible
                        ? 'text'
                        : 'password'
                      : field.type
                  }
                  id={field.name}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={field.value}
                  onChange={field.onChange}
                  required={field.required}
                />

                {field.type === 'password' && (
                  <button
                    type='button'
                    onClick={toggleVisibility}
                    aria-label={visible ? "Hide password" : "Show password"}
                    className='absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors'
                  >
                    {visible ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                )}
              </section>
              {field.error && <p className="text-[10px] text-red-500 font-black uppercase tracking-wider ml-1 mt-1">{field.error}</p>}
            </BoxReveal>
          </section>
        ))}

        {footer}

        <BoxReveal
          width='100%'
          boxColor='#A7F3D0'
          duration={0.3}
          overflow='visible'
        >
          <button
            className={cn(
              "w-full text-white font-black uppercase text-xs tracking-[0.2em] py-5 rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 mt-2",
              isLoading ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-slate-900 hover:scale-[1.02] active:scale-95 cursor-pointer"
            )}
            type='submit'
            disabled={isLoading}
          >
            {submitButton} <ArrowRight size={16}/>
          </button>
        </BoxReveal>

        <BoxReveal boxColor='#A7F3D0' duration={0.3} width="100%">
          <p className='text-center text-xs font-bold text-slate-500 mt-2'>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              className='text-[#A7F3D0] hover:text-emerald-500 hover:underline transition-colors ml-1 uppercase tracking-widest'
              onClick={onToggleMode}
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </BoxReveal>
      </form>
    </section>
  );
});

// ==================== AuthTabs Component ====================

interface AuthTabsProps {
  isLogin: boolean;
  onToggleMode: () => void;
  isLoading: boolean;
  fields: Field[];
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onGoogleLogin: () => void;
  footer?: ReactNode;
}

const AuthTabs = memo(function AuthTabs({
  isLogin,
  onToggleMode,
  isLoading,
  fields,
  onSubmit,
  onGoogleLogin,
  footer
}: AuthTabsProps) {
  return (
    <div className='flex justify-center w-full'>
      <div className='w-full flex flex-col justify-center items-center'>
        <AnimatedForm
          header={isLogin ? "Welcome Back" : "Join MEHRI"}
          subHeader={isLogin ? "Personalized tracking awaits." : "Start your personal wellness journey."}
          fields={fields}
          submitButton={isLogin ? "Sign In" : "Create Account"}
          isLogin={isLogin}
          onToggleMode={onToggleMode}
          isLoading={isLoading}
          onSubmit={onSubmit}
          onGoogleLogin={onGoogleLogin}
          footer={footer}
        />
      </div>
    </div>
  );
});

// ==================== Label Component ====================

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor?: string;
}

const Label = memo(function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        'text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1',
        className
      )}
      {...props}
    />
  );
});

// ==================== Exports ====================

export {
  Input,
  BoxReveal,
  Ripple,
  OrbitingCircles,
  TechOrbitDisplay,
  AnimatedForm,
  AuthTabs,
  Label,
};
