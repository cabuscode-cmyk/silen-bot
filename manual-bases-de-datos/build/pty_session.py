import pty,os,time,select,sys,json
cfg=json.load(sys.stdin)
db=cfg.get('db','postgres');lines=cfg['lines'];delay=cfg.get('delay',0.6)
pid,fd=pty.fork()
if pid==0:
    os.environ['TERM']='dumb';os.environ['PSQL_PAGER']=''
    os.execvp('psql',['psql','-h','/tmp','-p','5433','-U','postgres','-d',db,'-X','--no-readline'])
out=b''
def rd(t):
    global out
    end=time.time()+t
    while time.time()<end:
        r,_,_=select.select([fd],[],[],0.1)
        if r:
            try:d=os.read(fd,4096)
            except OSError:return
            if not d:return
            out+=d
rd(1.0)
for l in lines:
    os.write(fd,(l+'\n').encode());rd(delay)
os.write(fd,b'\\q\n');rd(0.5)
sys.stdout.write(out.decode('utf8','replace').replace('\r',''))
