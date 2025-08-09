use anchor_lang::{accounts::signer, prelude::*, system_program::{transfer, Transfer}};

declare_id!("FsPEZ6YaVCqwCmrUZxCTvwqamMXdzy3XsQ4TSpKY1ieq");

#[program]
pub mod hello_solana {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, hello: String) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        let data_account = &mut ctx.accounts.data_account;
        data_account.hello = hello;
        Ok(())
    }

    pub fn transfer_lamports(ctx: Context<TransferLamports>, amount: u64) -> Result<()> {
        // Ensure amount is greater than 0
        require!(amount > 0, ErrorCode::InvalidAmount);

        // Check if signer has enough lamports
        let from_account = &ctx.accounts.signer;
        require!(from_account.lamports() >= amount, ErrorCode::InsufficientFunds);

        // Perform the transfer using CPI
        transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.signer.to_account_info(),
                    to: ctx.accounts.recipient.to_account_info(),
                },
            ),
            amount,
        )?;

        msg!("Transferred {} lamports from {} to {}", 
            amount, 
            from_account.key(), 
            ctx.accounts.recipient.key());
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init,
        payer = signer,
        space = 8 + 200 // discriminator + string capacity
    )]
    pub data_account: Account<'info, DataAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct TransferLamports<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut)]
    /// CHECK: We're only modifying lamports, no need to deserialize
    pub recipient: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct DataAccount {
    pub hello: String,
}

#[error_code]
pub enum ErrorCode {
    #[msg("The transfer amount must be greater than 0")]
    InvalidAmount,
    #[msg("Insufficient funds for the transfer")]
    InsufficientFunds,
}